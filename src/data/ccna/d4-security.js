/* Domain 4.0 · Services & security (n052–n064) */
(function(){var L=window.ATLAS_CCNA.L,X=window.ATLAS_CCNA.X;

L('n052',{h:"Lock the device: strong secrets, a user account for each person, and AAA.",
p:["Protect privileged mode with enable secret. It stores a strong hash. Do not use enable password, which is weak. If both exist, enable secret is used.",
"Make a local user: username admin secret StrongPass1. Then on the remote lines: line vty 0 15, login local. Now people log in with their own username. service password-encryption only hides plain passwords with weak type 7 encryption. It is better than nothing, but it is easy to break. exec-timeout logs out idle users.",
"AAA means Authentication (who are you?), Authorization (what can you do?) and Accounting (what did you do?). Turn it on with aaa new-model. AAA can use local users or a central server."],
k:["enable secret (hashed) beats enable password.","username X secret Y + login local on lines.","service password-encryption = weak type 7, only hides passwords.","AAA = Authentication, Authorization, Accounting."],
a:"AAA is like a hotel: the front desk checks your ID (authentication), your key card opens only your room (authorization), and the system logs when you used it (accounting).",
lab:["A switch has enable password cisco and enable secret Str0ng!. Which one does enable ask for?",["The enable secret","The enable password","Both, one after the other","Neither"],"enable secret takes priority."],
t:"Explain the three parts of AAA and how to secure local access on a Cisco device.",
w:[["authentication","who"],["authorization","allowed","permission"],["accounting","log","record"]],
q:[["What does the A for Authorization mean?",["What a user is allowed to do","Who the user is","What the user did","Where the user is"],"Authorization = permissions."],
["Which line command makes VTY logins use local usernames?",["login local","login","password local","transport input local"],"login local uses the username database."],
["Which is the most secure way to protect privileged mode?",["enable secret","enable password","service password-encryption only","No password"],"enable secret uses a strong hash."]]});
X('n052',"After service password-encryption, the config shows password 7 0822455D0A16. How safe is this?",["Weak: type 7 is easy to reverse","Very safe: it is a strong hash","It is a SHA-256 hash","It is encrypted with AES-256"],"Type 7 only hides passwords from shoulder surfers.");
X('n052',"Which part of AAA records what commands an admin ran?",["Accounting","Authentication","Authorization","Auditing"],"Accounting tracks actions.");

L('n053',{h:"RADIUS is for network access. TACACS+ is for device administration.",
p:["With many devices, use a central AAA server (like Cisco ISE) instead of local users on every box.",
"RADIUS is an open standard. It uses UDP (1812 for authentication, 1813 for accounting). It only encrypts the password. It combines authentication and authorization. It is used for network access: Wi-Fi with 802.1X, VPN users.",
"TACACS+ was made by Cisco. It uses TCP port 49. It encrypts the whole message. It keeps authentication, authorization and accounting separate, so you can allow or deny each command. It is used for admins logging in to routers and switches."],
k:["RADIUS: UDP 1812/1813, encrypts only the password, network access.","TACACS+: TCP 49, encrypts everything, device admin.","TACACS+ can authorize each command.","Central server example: Cisco ISE."],
a:"RADIUS is the door guard who checks your ticket to enter the stadium. TACACS+ is the staff manager who decides which tools each worker may use, one by one.",
lab:["A company wants to control which commands each network admin can run on routers. Which protocol?",["TACACS+","RADIUS","SNMPv1","TFTP"],"TACACS+ supports per-command authorization."],
t:"Explain the differences between RADIUS and TACACS+ and when to use each.",
w:[["radius","udp","1812"],["tacacs","tcp","49"],["encrypt","whole","password","command"]],
q:[["Which protocol encrypts the entire packet body?",["TACACS+","RADIUS","Telnet","SNMPv2c"],"RADIUS only encrypts the password."],
["Which transport does RADIUS use?",["UDP","TCP","ICMP","GRE"],"RADIUS uses UDP 1812/1813."],
["Which is best for Wi-Fi 802.1X user logins?",["RADIUS","TACACS+","SSH","NTP"],"RADIUS is used for network access."]]});
X('n053',"Which TCP port does TACACS+ use?",["49","1812","22","161"],"TACACS+ uses TCP 49.");
X('n053',"Which protocol combines authentication and authorization in one step?",["RADIUS","TACACS+","SSH","SCP"],"RADIUS combines them; TACACS+ separates them.");

L('n054',{h:"Use SSH, not Telnet. SSH encrypts everything. Telnet sends passwords in plain text.",
p:["Telnet (TCP 23) sends everything in clear text, including passwords. Anyone capturing traffic can read them. SSH (TCP 22) encrypts the session.",
"Steps to set up SSH: 1) hostname R1. 2) ip domain-name example.com. 3) crypto key generate rsa (use 2048 bits). 4) ip ssh version 2. 5) username admin secret Pass. 6) line vty 0 15, login local, transport input ssh.",
"transport input ssh blocks Telnet on those lines. You can also limit who connects with an ACL: access-class 10 in on the VTY lines. Check with show ip ssh."],
k:["SSH = TCP 22, encrypted. Telnet = TCP 23, clear text.","Need hostname + domain name before making RSA keys.","crypto key generate rsa, ip ssh version 2.","line vty: login local + transport input ssh."],
a:"Telnet is a postcard anyone can read. SSH is a sealed, locked envelope.",
lab:["crypto key generate rsa fails with an error about the name. What is missing?",["A hostname other than the default and an ip domain-name","The enable secret","A DHCP pool","A default route"],"RSA keys are named from hostname and domain name."],
t:"Explain why SSH is better than Telnet and list the steps to enable SSH.",
w:[["ssh","encrypt"],["telnet","clear","plain"],["rsa","crypto key","domain-name","domain name"]],
q:[["Which port does SSH use?",["TCP 22","TCP 23","UDP 22","TCP 443"],"SSH = TCP 22."],
["Which line command allows only SSH?",["transport input ssh","login ssh","ssh only","ip ssh line"],"transport input ssh blocks Telnet."],
["Which command creates the keys for SSH?",["crypto key generate rsa","ip ssh keys","ssh-keygen ios","crypto ssh enable"],"RSA keys are needed for SSH."]]});
X('n054',"Which command makes the router use only SSH version 2?",["ip ssh version 2","ssh v2 only","transport input ssh2","crypto ssh 2"],"ip ssh version 2.");
X('n054',"Why should Telnet be disabled?",["It sends usernames and passwords in clear text","It is too fast","It uses UDP","It needs RSA keys"],"Telnet has no encryption.");

L('n055',{h:"Move files safely with SCP or SFTP. TFTP and FTP are not secure.",
p:["Network engineers copy files: IOS images and configuration backups. TFTP (UDP 69) has no login and no encryption. FTP (TCP 20 and 21) has a login but sends everything in clear text.",
"SCP (Secure Copy) and SFTP (SSH File Transfer Protocol) both run over SSH (TCP 22). They encrypt the files and the login.",
"On a Cisco device, SSH must work first. Then ip scp server enable lets the device receive files by SCP. To copy from a server: copy scp: flash:. Always check the file hash after copying an IOS image (verify /md5)."],
k:["TFTP = UDP 69, no login, no encryption.","FTP = TCP 20/21, login but clear text.","SCP and SFTP = over SSH (TCP 22), encrypted.","ip scp server enable; copy scp: flash:."],
a:"TFTP is handing a package to anyone who asks. SCP is a locked courier van that checks your ID.",
lab:["An engineer must copy a new IOS image to a router over an untrusted network. Which method?",["SCP","TFTP","FTP","Telnet"],"SCP encrypts the transfer."],
t:"Explain why SCP and SFTP are safer than TFTP and FTP.",
w:[["scp","sftp"],["ssh","encrypt"],["tftp","ftp","clear","no login"]],
q:[["Which protocol uses UDP 69 and has no authentication?",["TFTP","SFTP","SCP","SSH"],"TFTP is simple and insecure."],
["Which secure file transfer protocols run over SSH?",["SCP and SFTP","FTP and TFTP","HTTP and SNMP","Telnet and FTP"],"Both use SSH."],
["Which command lets a Cisco device act as an SCP server?",["ip scp server enable","scp enable","ip ftp server","transport input scp"],"ip scp server enable."]]});
X('n055',"Which command copies a file from an SCP server into the router's flash?",["copy scp: flash:","copy flash: scp:","copy tftp: scp:","scp copy flash"],"Source first, then destination.");
X('n055',"Which transfer protocol sends the login and data in clear text over TCP?",["FTP","SFTP","SCP","HTTPS"],"FTP is not encrypted.");

L('n056',{h:"NAT changes private addresses into public ones so many devices can share the internet.",
p:["Private addresses (like 192.168.1.10) cannot be used on the internet. NAT changes the source address when traffic leaves. Mark interfaces: ip nat inside on the LAN side, ip nat outside on the internet side.",
"Static NAT = one private address always maps to one public address. Good for a server: ip nat inside source static 192.168.1.10 203.0.113.10. Dynamic NAT = private addresses borrow from a pool of public addresses. PAT (NAT overload) = many private addresses share ONE public address by using different port numbers: ip nat inside source list 1 interface g0/1 overload.",
"Words: inside local = the private address of the inside host. Inside global = the public address that represents it. Check with show ip nat translations. Common mistakes: inside and outside swapped, or the ACL does not match the LAN."],
k:["ip nat inside (LAN) and ip nat outside (internet).","Static NAT = 1 to 1. Dynamic = from a pool. PAT/overload = many to 1 with ports.","Inside local = private IP. Inside global = public IP.","show ip nat translations."],
a:"PAT is like an apartment building with one street address. Each apartment has its own number (port), so the mail still finds the right person.",
lab:["Home network: 50 PCs and one public IP from the ISP. Which NAT type?",["PAT (overload)","Static NAT","Dynamic NAT with a 50-address pool","No NAT is needed"],"PAT lets many hosts share one public IP."],
t:"Explain static NAT, dynamic NAT and PAT, and the inside local and inside global terms.",
w:[["static","one to one","1 to 1"],["pat","overload","port"],["inside local","inside global","private","public"]],
q:[["What does the overload keyword turn on?",["PAT","Static NAT","DHCP","Routing"],"Overload = PAT."],
["What is the inside global address?",["The public address that represents an inside host","The private address of the inside host","The server's address on the internet","The router's loopback"],"Inside global is the translated public address."],
["A web server inside needs the same public IP all the time. Which NAT?",["Static NAT","PAT","Dynamic NAT","No NAT"],"Static NAT gives a permanent 1-to-1 mapping."]]});
X('n056',"NAT is configured, but show ip nat translations is empty. The ACL matches the LAN. The LAN interface has ip nat outside and the WAN interface has ip nat inside. What is wrong?",["The inside and outside interfaces are swapped","The ACL is too large","PAT needs a static route","NAT only works for IPv6"],"Inside must face the LAN, outside the internet.");
X('n056',"Which address is the inside local address in this translation: 192.168.10.5:1025 → 203.0.113.2:1025?",["192.168.10.5","203.0.113.2","1025","The ISP's DNS server"],"Inside local is the private inside address.");

L('n057',{h:"DNS records tell the world where names point. Know A, AAAA, CNAME, MX and PTR.",
p:["DNS turns names into addresses. The main record types: A = name to IPv4 address. AAAA = name to IPv6 address. CNAME = a nickname that points to another name. MX = the mail server for a domain. PTR = reverse lookup, IP to name. NS = the name servers for a domain.",
"Each record has a TTL (time to live). Computers cache the answer for that long. If you change a record, old answers may stay cached until the TTL ends.",
"DNS uses UDP port 53 (and TCP 53 for big answers and zone transfers). Test with nslookup www.example.com. On a Cisco router: ip name-server 8.8.8.8. Use no ip domain-lookup so a typo does not make the router try to look it up as a name."],
k:["A = IPv4. AAAA = IPv6. CNAME = alias. MX = mail. PTR = reverse.","TTL = how long answers are cached.","DNS = UDP 53 (TCP 53 too).","nslookup tests DNS."],
a:"DNS is a phone book. An A record is a name with a number. A CNAME is 'see also another name'. MX is 'send letters to this mailroom'.",
lab:["Email to @example.com is not delivered, but the website works. Which record do you check?",["MX","A","PTR","AAAA"],"MX records point to mail servers."],
t:"Explain the common DNS record types and what TTL means.",
w:[["a record","aaaa","ipv4","ipv6"],["cname","alias","mx","mail"],["ttl","cache"]],
q:[["Which record maps a name to an IPv6 address?",["AAAA","A","MX","PTR"],"AAAA = IPv6."],
["Which record is used for reverse lookups (IP to name)?",["PTR","CNAME","MX","NS"],"PTR records do reverse lookups."],
["Which port does DNS normally use for queries?",["UDP 53","TCP 80","UDP 67","TCP 25"],"DNS = UDP 53."]]});
X('n057',"An admin changed the A record for www.example.com an hour ago. Some users still reach the old server. What is the likely reason?",["Their DNS answer is still cached until the TTL expires","The MX record is wrong","PTR records override A records","DNS uses TCP only"],"Caching lasts for the record's TTL.");
X('n057',"shop.example.com should always point wherever www.example.com points. Which record do you create?",["A CNAME for shop pointing to www","An MX record for shop","A PTR record for www","An NS record for shop"],"A CNAME is an alias for another name.");

L('n058',{h:"A VPN builds a private, encrypted tunnel across the public internet.",
p:["A site-to-site VPN connects two offices. The routers or firewalls build the tunnel. Users do not need special software. A remote-access VPN connects one user's laptop to the company. The user runs a VPN client (for example Cisco Secure Client). Remote access often uses TLS or IPsec.",
"IPsec gives four protections: confidentiality (encryption), integrity (the data was not changed), authentication (the other side is who it says) and anti-replay (old packets cannot be resent).",
"IPsec parts: IKE builds the tunnel (UDP 500, and UDP 4500 when NAT is in the way). ESP (IP protocol 50) encrypts the data. AH (protocol 51) checks integrity but does NOT encrypt. GRE builds simple tunnels without encryption, so GRE is often run inside IPsec."],
k:["Site-to-site = office to office. Remote access = one user to the office.","IPsec: confidentiality, integrity, authentication, anti-replay.","ESP encrypts. AH does not encrypt.","IKE uses UDP 500 (4500 with NAT-T). GRE has no encryption."],
a:"A VPN is like an armored truck driving on public roads. Everyone sees the road, but nobody sees what is inside.",
lab:["A company links two branch offices so all PCs can reach each other without installing software. Which VPN?",["Site-to-site IPsec VPN","Remote-access VPN on every PC","A GRE tunnel with no encryption over the internet","Telnet"],"Site-to-site tunnels are built by the edge devices."],
t:"Explain the two kinds of VPN and the protections IPsec provides.",
w:[["site-to-site","site to site","remote access","remote-access"],["encrypt","confidential","esp"],["integrity","authentication","ipsec"]],
q:[["Which IPsec protocol encrypts data?",["ESP","AH","GRE","IKE only"],"ESP gives encryption."],
["What does GRE lack on its own?",["Encryption","The ability to carry traffic","An IP header","Routing support"],"GRE tunnels are not encrypted."],
["Which VPN type needs software on the user's laptop?",["Remote-access VPN","Site-to-site VPN","GRE between routers","None"],"Remote-access VPNs use a client."]]});
X('n058',"Which port does IKE use to set up an IPsec tunnel when no NAT is in the path?",["UDP 500","TCP 22","UDP 53","TCP 443"],"IKE uses UDP 500 (UDP 4500 with NAT-T).");
X('n058',"Which security service makes sure data was not changed in transit?",["Integrity","Confidentiality","Availability","Anti-virus"],"Integrity uses hashing to detect changes.");

L('n059',{h:"Standard ACLs filter by source address only. Put them close to the destination.",
p:["An ACL (access control list) is a list of permit and deny rules. The router reads it from top to bottom and stops at the first match. At the end there is an invisible deny any. So if nothing matches, the packet is dropped.",
"Standard ACLs are numbered 1–99 (and 1300–1999). They only check the SOURCE address. Because they are not specific, place them close to the destination. Example: access-list 10 permit 192.168.1.0 0.0.0.255. Apply it: ip access-group 10 out on an interface.",
"Wildcard masks are the opposite of subnet masks: 0 = must match, 255 = anything. /24 = 0.0.0.255. /26 = 0.0.0.63. host 10.1.1.1 = 10.1.1.1 0.0.0.0. any = 0.0.0.0 255.255.255.255. One ACL per interface, per direction, per protocol."],
k:["Top-down, first match wins, implicit deny any at the end.","Standard = 1–99, 1300–1999, source only, place near destination.","Wildcard = 255.255.255.255 − subnet mask.","host = one address. any = every address."],
a:"An ACL is a bouncer with a list. The bouncer reads from the top, stops at your name, and turns away anyone not on the list.",
lab:["ACL 5 has only: access-list 5 deny 10.1.1.0 0.0.0.255. What happens to traffic from 10.2.2.2?",["It is denied by the implicit deny any","It is permitted","It is permitted only on Mondays","It is logged and permitted"],"Add access-list 5 permit any to allow other traffic."],
t:"Explain how a router reads an ACL, the implicit deny, and where to place a standard ACL.",
w:[["top","first match","order"],["implicit deny","deny any","deny"],["source","destination","wildcard"]],
q:[["What is the wildcard mask for a /24 network?",["0.0.0.255","255.255.255.0","0.0.0.0","255.0.0.0"],"Invert the subnet mask."],
["What do standard ACLs check?",["Source IP address only","Source and destination ports","Destination IP only","MAC addresses"],"Standard = source only."],
["Where should a standard ACL be placed?",["Close to the destination","Close to the source","On every interface","Only on the ISP"],"Placing it near the source would block too much."]]});
X('n059',"What is the wildcard mask for 172.16.8.0/22?",["0.0.3.255","0.0.7.255","255.255.252.0","0.0.0.255"],"255.255.255.255 − 255.255.252.0 = 0.0.3.255.");
X('n059',"Which keyword means the same as 0.0.0.0 255.255.255.255?",["any","host","all","none"],"any matches every address.");
X('n059',"ACL lines: 1) deny host 10.1.1.5, 2) permit 10.1.1.0 0.0.0.255. Traffic from 10.1.1.5 arrives. What happens?",["Denied by line 1","Permitted by line 2","Permitted because line 2 is more general","Dropped only after logging"],"The first match wins.");

L('n060',{h:"Extended ACLs check protocol, source, destination and port. Put them close to the source.",
p:["Extended ACLs are numbered 100–199 (and 2000–2699). They can check the protocol (ip, tcp, udp, icmp), the source, the destination and the port.",
"Format: access-list 101 permit tcp <source> <wildcard> <destination> <wildcard> eq <port>. Example: access-list 101 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.2 eq 443. Common ports: 22 SSH, 23 Telnet, 53 DNS, 80 HTTP (www), 443 HTTPS.",
"Place extended ACLs close to the source, so unwanted traffic is dropped early. Put specific lines before general ones. Named ACLs are easier to edit: ip access-list extended WEB-ONLY. Check hits with show access-lists."],
k:["Extended = 100–199, 2000–2699: protocol, source, destination, port.","Place near the source.","eq 80 = www, eq 443 = HTTPS, eq 22 = SSH.","Specific lines first. show access-lists shows match counters."],
a:"An extended ACL is a bouncer who checks who you are, where you are going, and which door you want to use.",
lab:["Block PC 10.1.1.50 from using Telnet to router 10.0.0.1, but allow everything else. Which first line?",["access-list 110 deny tcp host 10.1.1.50 host 10.0.0.1 eq 23","access-list 10 deny host 10.1.1.50","access-list 110 deny tcp any any eq 22","access-list 110 permit ip any any"],"Then add access-list 110 permit ip any any."],
t:"Explain how an extended ACL is different from a standard ACL and where to place it.",
w:[["extended","protocol","port"],["source","destination"],["close","near","placement","place"]],
q:[["Which ACL number range is extended?",["100–199","1–99","200–299","1300–1999"],"100–199 and 2000–2699 are extended."],
["Which port is HTTPS?",["443","80","22","53"],"HTTPS = TCP 443."],
["Where should an extended ACL be placed?",["Close to the source","Close to the destination","Only on loopbacks","On the console line"],"It is specific, so drop traffic early."]]});
X('n060',"access-list 120 permit tcp any host 192.168.5.10 eq 80 is the only line, applied inbound on the LAN interface. What happens to DNS traffic from the LAN?",["It is dropped by the implicit deny","It is permitted","It is permitted because DNS uses UDP","It is redirected to port 80"],"Only web traffic to that host is permitted.");
X('n060',"Which command shows how many packets matched each ACL line?",["show access-lists","show ip interface brief","show running-config acl-count","show ip route acl"],"show access-lists shows hit counters.");

L('n061',{h:"DHCP snooping stops fake DHCP servers. Trust only the ports toward the real server.",
p:["An attacker can plug in a fake DHCP server and give users a wrong gateway. Then their traffic goes through the attacker. DHCP snooping stops this.",
"Ports are trusted or untrusted. All ports are untrusted by default. Untrusted ports may send DHCP client messages (Discover, Request) but NOT server messages (Offer, Ack). Make the uplink toward the real DHCP server trusted: ip dhcp snooping trust.",
"Turn it on: ip dhcp snooping, then ip dhcp snooping vlan 10. Snooping builds a binding table: MAC, IP, VLAN, port and lease. DAI and IP Source Guard use this table. You can limit DHCP messages per second with ip dhcp snooping limit rate."],
k:["Stops rogue DHCP servers.","Untrusted (default) ports drop DHCP server messages (Offer/Ack).","Trust the uplink to the real DHCP server.","Builds the binding table: MAC, IP, VLAN, port."],
a:"DHCP snooping is like a teacher who only lets the real school office hand out locker numbers. A student who tries to hand them out is ignored.",
lab:["After enabling DHCP snooping, no one gets an address. The DHCP server is reached through uplink G0/24. What is missing?",["ip dhcp snooping trust on G0/24","ip dhcp snooping trust on every user port","no ip dhcp snooping","ip helper-address on the PCs"],"The uplink must be trusted so Offers can pass."],
t:"Explain how DHCP snooping stops a fake DHCP server, including trusted and untrusted ports.",
w:[["trusted","trust"],["untrusted","offer","server message"],["rogue","fake","binding"]],
q:[["By default, are switch ports trusted or untrusted for DHCP snooping?",["Untrusted","Trusted","Half-trusted","Only trunk ports are untrusted"],"All ports start untrusted."],
["Which DHCP message is dropped on an untrusted port?",["DHCP Offer","DHCP Discover","DHCP Request","DHCP Release from a client"],"Offers come from servers."],
["What does DHCP snooping build that other features use?",["A binding table","A routing table","A VLAN database","A DNS cache"],"The binding table lists MAC, IP, VLAN and port."]]});
X('n061',"A user plugs a home router into an office port. Users start getting the wrong default gateway. Which feature stops this?",["DHCP snooping","PortFast","CDP","HSRP"],"Snooping blocks DHCP offers from untrusted ports.");
X('n061',"Which command turns on DHCP snooping for VLAN 20 after enabling it globally?",["ip dhcp snooping vlan 20","dhcp snooping enable 20","ip dhcp vlan 20 snooping","switchport dhcp snooping 20"],"ip dhcp snooping vlan <id>.");

L('n062',{h:"Dynamic ARP Inspection stops fake ARP replies. It checks them against the DHCP snooping table.",
p:["In ARP spoofing (ARP poisoning), an attacker sends fake ARP replies: 'the gateway's IP is at my MAC'. Then traffic goes to the attacker. This is a man-in-the-middle attack.",
"Dynamic ARP Inspection (DAI) checks ARP messages on untrusted ports. It compares the IP and MAC in the ARP message with the DHCP snooping binding table. If they do not match, the ARP is dropped.",
"DAI needs DHCP snooping. Turn it on per VLAN: ip arp inspection vlan 10. Trust uplinks: ip arp inspection trust. Hosts with static IP addresses are not in the binding table, so they need an ARP ACL, or they will be blocked."],
k:["DAI stops ARP spoofing / man-in-the-middle.","Checks ARP against the DHCP snooping binding table.","ip arp inspection vlan X; trust the uplinks.","Static-IP hosts need ARP ACLs."],
a:"DAI is like checking ID badges against the official staff list. Someone claiming to be the gateway with the wrong badge is stopped.",
lab:["After enabling DAI, a server with a static IP loses connection. DHCP users are fine. Why?",["The static server is not in the DHCP snooping table; add an ARP ACL","DAI blocks all servers","The server needs a trunk","DNS is down"],"DAI only trusts bindings it knows."],
t:"Explain what ARP spoofing is and how DAI stops it.",
w:[["arp","spoof","poison"],["binding","snooping","table"],["trust","dai","inspection"]],
q:[["Which feature does DAI depend on?",["DHCP snooping","HSRP","OSPF","PoE"],"DAI uses the snooping binding table."],
["What attack does DAI prevent?",["ARP spoofing (man-in-the-middle)","Brute-force password guessing","DNS cache misses","Broadcast storms"],"DAI checks ARP messages."],
["Which ports should be trusted for DAI?",["Uplinks to other switches and routers","All user ports","No ports","Only ports with phones"],"Trust the infrastructure links."]]});
X('n062',"Which command enables Dynamic ARP Inspection for VLAN 10?",["ip arp inspection vlan 10","arp inspection enable 10","ip dai vlan 10","switchport arp inspection 10"],"ip arp inspection vlan <id>.");
X('n062',"An attacker sends ARP replies claiming the default gateway's IP. What is the attacker trying to do?",["Make victims send their traffic through the attacker","Get a DHCP lease","Shut down STP","Change the VLAN"],"This is ARP poisoning for man-in-the-middle.");

L('n063',{h:"Storm control limits floods of traffic. RA Guard blocks fake IPv6 routers.",
p:["A broadcast storm can fill all links and stop the network. Storm control watches a port. If broadcast, multicast or unknown unicast traffic goes above a level, the switch drops the extra traffic. It can also shut the port or send an alert.",
"Example: storm-control broadcast level 20.00 means: if broadcasts use more than 20% of the port's bandwidth, drop the extra. Add storm-control action shutdown to err-disable the port instead.",
"IPv6 hosts learn their gateway from Router Advertisements (RAs). A fake RA can send traffic to an attacker. RA Guard blocks RAs on ports where hosts live, and allows them only on ports toward real routers."],
k:["Storm control = limit broadcast, multicast or unknown unicast on a port.","Level is a percent of port bandwidth.","Actions: drop (default), shutdown, or trap.","RA Guard = block IPv6 Router Advertisements from host ports."],
a:"Storm control is like a dam gate that only lets so much water through. RA Guard is a sign saying 'only real bus stops can announce bus routes'.",
lab:["A loop causes a broadcast storm from one access port. Which feature would limit the damage?",["Storm control on that port","CDP","LLDP","PoE"],"Storm control drops traffic above the level."],
t:"Explain what storm control does and why RA Guard is needed for IPv6.",
w:[["storm","broadcast","level"],["router advertisement","ra","ipv6"],["rogue","fake","block"]],
q:[["What does storm-control broadcast level 10.00 do?",["Drops broadcasts above 10% of the port bandwidth","Allows only 10 broadcasts total","Sets VLAN 10 as the broadcast VLAN","Shuts every port in 10 seconds"],"The level is a percentage."],
["What IPv6 message does RA Guard block on host ports?",["Router Advertisements","Neighbor Solicitations","Echo requests","DNS queries"],"RA Guard stops rogue routers."],
["Which storm control action err-disables the port?",["shutdown","trap","drop","permit"],"storm-control action shutdown."]]});
X('n063',"Hosts in an IPv6 VLAN start using a laptop as their default gateway. Which feature prevents this?",["RA Guard","Storm control","PortFast","LACP"],"The laptop is sending rogue Router Advertisements.");
X('n063',"Which traffic types can storm control limit?",["Broadcast, multicast and unknown unicast","Only OSPF hellos","Only TCP","Only traffic to the internet"],"Storm control can limit all three.");

L('n064',{h:"Port security limits which devices can use a switch port.",
p:["Port security limits the number of MAC addresses on a port. Default: 1 MAC address. Default violation action: shutdown (the port goes err-disabled). Port security only works on access (or trunk) ports, not dynamic ports.",
"Commands: switchport mode access, switchport port-security, switchport port-security maximum 2, switchport port-security mac-address sticky. Sticky learns the MACs it sees and saves them in the running-config.",
"Violation modes: protect = drop bad traffic quietly. restrict = drop it and count/log it. shutdown = err-disable the whole port (default). Check with show port-security interface g0/1. To recover a shutdown port, fix it, then shutdown and no shutdown."],
k:["Default: max 1 MAC, violation shutdown.","Must set switchport mode access first.","Sticky = learn MACs and save them in the running-config.","Modes: protect (silent drop), restrict (drop + log), shutdown (err-disabled)."],
a:"Port security is like a parking spot with a license-plate list. A car not on the list is towed (shutdown), ticketed (restrict) or just blocked (protect).",
lab:["A port with default port security goes err-disabled when a user adds a hub and a second PC. Why?",["The default maximum is 1 MAC and the action is shutdown","The hub needs PoE","DHCP snooping blocked it","The VLAN was deleted"],"A second MAC broke the default rule."],
t:"Explain what port security does, its default settings, and the three violation modes.",
w:[["port security","port-security","mac"],["maximum","sticky"],["shutdown","restrict","protect","violation"]],
q:[["What is the default violation mode of port security?",["shutdown","protect","restrict","log"],"Default = shutdown."],
["Which mode drops bad traffic and also logs and counts it?",["restrict","protect","shutdown","permit"],"restrict logs and increments the counter."],
["What does sticky do?",["Learns MAC addresses and adds them to the running-config","Stops the port from shutting down","Adds a voice VLAN","Turns on PoE"],"Sticky MACs are learned dynamically and saved in config."]]});
X('n064',"switchport port-security is rejected on a port. The port is in dynamic auto mode. What is the fix?",["Set switchport mode access first","Enable CDP","Use maximum 0","Shut down the VLAN"],"Port security needs a static access (or trunk) mode.");
X('n064',"Which command shows port security status and the violation count for G0/5?",["show port-security interface g0/5","show mac security g0/5","show interfaces g0/5 security","show port g0/5"],"show port-security interface.");
})();
