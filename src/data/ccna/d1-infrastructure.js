/* Domain 1.0 · Infrastructure & connectivity (n016–n027) */
(function(){var L=window.ATLAS_CCNA.L,X=window.ATLAS_CCNA.X;

L('n016',{h:"Most network problems start with the cable. Check the cable first.",
p:["A bad cable makes errors. The switch counts these errors for you. You can see them with the command show interfaces.",
"CRC errors mean frames arrived damaged. The usual causes are a bad cable, a loose plug, or electrical noise from motors or lights. Late collisions usually mean a duplex mismatch: one side is full duplex and the other side is half duplex.",
"Old rules said: use a straight-through cable between different devices (PC to switch) and a crossover cable between the same kind of devices (switch to switch). Today most ports have Auto-MDIX, which fixes this by itself."],
k:["CRC errors = damaged frames. Think: cable, plug or noise.","Late collisions = duplex mismatch. Set both sides the same, or both to auto.","Copper Ethernet (UTP) works up to 100 meters.","Auto-MDIX lets any Ethernet cable type work."],
a:"A cable is like a garden hose. If it has a hole, some water (data) leaks out and arrives broken.",
lab:["A port shows thousands of CRC errors. The other side is set correctly. What do you check first?",["The cable and its plugs","The DNS server","The VLAN name","The routing table"],"CRC errors are physical problems. Swap or test the cable first."],
t:"Explain what CRC errors and late collisions tell you, and what you would check first.",
w:[["crc","error","damage"],["cable","plug","connector","noise","interference"],["duplex","collision","mismatch"]],
q:[["What do many CRC errors on an interface usually point to?",["A physical problem such as a bad cable","A wrong DNS server","A missing static route","A wrong VLAN name"],"CRC means the frame was damaged on the wire."],
["One side is full duplex, the other side is half duplex. What counter usually grows?",["Late collisions","DNS failures","OSPF neighbors","DHCP leases"],"A duplex mismatch causes late collisions on the half-duplex side."],
["What is the maximum length of a normal copper Ethernet (UTP) cable run?",["100 meters","10 meters","1 kilometer","5 kilometers"],"Copper Ethernet is rated to 100 meters."]]});
X('n016',"A switch port shows a rising number of CRC errors and input errors. Speed and duplex match on both ends. What is the most likely cause?",["A damaged cable or electrical interference","A wrong default gateway on the PC","A missing VLAN on the trunk","A wrong DNS record"],"Damaged frames with matching duplex settings point to the physical layer.");
X('n016',"show interfaces shows many late collisions on a port. What should you check?",["Duplex settings on both ends","The DHCP pool size","The OSPF area number","The NTP server"],"Late collisions are the classic sign of a duplex mismatch.");

L('n017',{h:"Fiber sends light, not electricity. Single-mode goes far. Multimode goes short.",
p:["Fiber optic cable carries pulses of light through glass. Electrical noise cannot hurt it, and it can go much farther than copper.",
"Single-mode fiber has a very thin core (about 9 microns) and uses a laser. It can go many kilometers. The jacket is often yellow. Multimode fiber has a wider core (50 or 62.5 microns) and goes a few hundred meters. The jacket is often orange or aqua.",
"Switches use small plug-in modules called transceivers, like SFP or SFP+. The transceiver must match the fiber type and the speed on both ends. Dirty connectors are a common cause of fiber problems."],
k:["Single-mode = thin core, laser, long distance (kilometers).","Multimode = wider core, short distance (hundreds of meters).","SFP/SFP+ transceivers plug into the switch and must match on both ends.","Fiber is not affected by electrical interference (EMI)."],
a:"Single-mode is like a laser pointer: thin and travels far. Multimode is like a flashlight: wide and fades sooner.",
lab:["Two buildings are 8 km apart. Which link should you use?",["Single-mode fiber with matching transceivers","Copper UTP cable","Multimode fiber with mismatched transceivers","A console cable"],"Only single-mode fiber reaches kilometers. Copper stops at 100 m."],
t:"Explain the difference between single-mode and multimode fiber and when you would use each.",
w:[["single-mode","singlemode","single mode","laser"],["multimode","multi-mode","multi mode","short"],["distance","far","kilometer","km","long"]],
q:[["Which fiber type is best for a 10 km link?",["Single-mode","Multimode","UTP Cat 6","Coaxial"],"Single-mode fiber carries light over long distances."],
["What is the small plug-in module that connects fiber to a switch port?",["A transceiver such as an SFP","A patch panel","A console cable","A power injector"],"SFP and SFP+ modules are transceivers."],
["Why use fiber near large electric motors?",["Light is not affected by electrical interference","Fiber is cheaper than copper","Fiber needs no connectors","Fiber carries power to devices"],"Fiber carries light, so EMI does not damage the signal."]]});
X('n017',"A fiber link between two switches will not come up. One side has a single-mode transceiver and the other side has a multimode transceiver. What is the fix?",["Use matching transceivers and the matching fiber type","Change the VLAN to 1","Enable CDP","Replace the fiber with a 300 m copper cable"],"Both ends must use the same fiber type and matching optics.");
X('n017',"Which description fits multimode fiber?",["Wider core, shorter distances such as inside one building","Thin core, laser, tens of kilometers","Copper pairs twisted together","Radio signal in the 5 GHz band"],"Multimode has a larger core and is used for shorter runs.");

L('n018',{h:"One real server can run many pretend computers. These are virtual machines and containers.",
p:["A hypervisor is software that splits one physical server into many virtual machines (VMs). Each VM has its own operating system, like Windows or Linux.",
"A Type 1 hypervisor runs directly on the hardware (bare metal). Examples are VMware ESXi and Microsoft Hyper-V. Data centers use Type 1. A Type 2 hypervisor runs as an app on top of a normal operating system. Examples are VirtualBox and VMware Workstation. People use Type 2 on laptops.",
"A container is lighter than a VM. Containers share the host's operating system kernel and only package the app and what it needs. Docker is a common container tool. VMs talk to the network through a virtual switch inside the server."],
k:["Type 1 hypervisor = bare metal (ESXi, Hyper-V). Used in data centers.","Type 2 hypervisor = runs on a normal OS (VirtualBox). Used on laptops.","Each VM has its own full operating system.","Containers share the host kernel, so they are smaller and start faster."],
a:"A VM is like a separate apartment with its own kitchen. A container is like a room in a shared house: everyone shares the kitchen (the kernel).",
lab:["A team wants many small apps that start in seconds and share one Linux kernel. What should they use?",["Containers","Type 2 hypervisor on a laptop","One VM per app with its own OS","A bigger router"],"Containers share the host kernel and start fast."],
t:"Explain the difference between a Type 1 hypervisor, a Type 2 hypervisor and a container.",
w:[["type 1","bare metal","hardware"],["type 2","laptop","on top","host os"],["container","kernel","docker","share"]],
q:[["Which hypervisor runs directly on the server hardware?",["Type 1","Type 2","A container engine","A web browser"],"Type 1 is bare metal."],
["What do containers share with each other?",["The host operating system kernel","Their own separate full OS","The same IP address always","Nothing at all"],"Containers share the host kernel; VMs each have their own OS."],
["How do VMs on one server reach the physical network?",["Through a virtual switch","Through a console cable","Through Bluetooth","They cannot reach the network"],"The hypervisor provides a virtual switch."]]});
X('n018',"A student installs VirtualBox on a Windows laptop to run a Linux VM. What kind of hypervisor is VirtualBox?",["Type 2","Type 1","A container","A load balancer"],"Type 2 hypervisors run as applications on an existing OS.");
X('n018',"Which statement about virtual machines and containers is true?",["Each VM has its own operating system; containers share the host kernel","Containers each need their own full operating system","VMs cannot use networking","Containers only run on Type 2 hypervisors"],"That is the main difference between them.");

L('n019',{h:"Check the four numbers: IP address, mask, gateway and DNS.",
p:["Every host needs four settings to work well: an IP address, a subnet mask, a default gateway and a DNS server. On Windows, type ipconfig /all to see them.",
"If the address starts with 169.254, the PC could not reach a DHCP server. It gave itself an automatic address (APIPA). This address only works on the local link.",
"Other common mistakes: the gateway is in a different subnet than the PC, the mask is wrong, or two devices use the same IP address (a duplicate address conflict)."],
k:["169.254.x.x (APIPA) = DHCP failed.","The default gateway must be in the same subnet as the host.","A wrong mask can make the PC think local hosts are remote (or remote hosts are local).","Duplicate IP addresses cause on-and-off connectivity."],
a:"The four settings are like a home address, the neighborhood, the bus stop to leave the neighborhood, and the phone book.",
lab:["A PC shows IP 169.254.20.7. Other PCs work. What is the most likely problem?",["The PC did not get an answer from a DHCP server","The DNS server is wrong","The website is down","The PC has too much RAM"],"169.254 means the PC gave itself an address because DHCP failed."],
t:"Explain what a 169.254 address means and list the four settings a host needs.",
w:[["169.254","apipa","automatic"],["dhcp","server","lease"],["gateway","mask","dns"]],
q:[["A PC has address 169.254.10.5. What does this mean?",["It could not get an address from DHCP","It has a public address","It is a router","It is using IPv6 only"],"APIPA addresses are self-assigned when DHCP fails."],
["PC: 10.1.1.20/24, gateway 10.1.2.1. What is wrong?",["The gateway is not in the PC's subnet","Nothing is wrong","The mask is too long","The address is a broadcast address"],"10.1.2.1 is outside 10.1.1.0/24."],
["Which Windows command shows IP, mask, gateway and DNS?",["ipconfig /all","show vlan","tracert /all","netstat -dns"],"ipconfig /all lists all IP settings."]]});
X('n019',"A host is 192.168.5.40/24 with default gateway 192.168.6.1. It can reach local hosts but nothing remote. Why?",["The gateway is not in the host's subnet","The DNS server is down","The switch port is in VLAN 1","The host needs a /16 mask to use a gateway"],"The default gateway must be on the local subnet.");
X('n019',"Two PCs keep losing connectivity at random. Both are configured with 10.0.0.15. What is the problem?",["A duplicate IP address conflict","A CRC error","A routing loop","An NTP mismatch"],"Two hosts with the same IP fight over that address.");

L('n020',{h:"Subnetting is a recipe. Find the magic number, then count.",
p:["The magic number (block size) is 256 minus the interesting mask octet. For /26 the mask is 255.255.255.192, so the block size is 256 − 192 = 64. Subnets start at 0, 64, 128 and 192.",
"Usable hosts = 2 to the power of host bits, minus 2. A /26 has 6 host bits: 2^6 = 64, minus 2 = 62 hosts. The first address is the network address. The last address is the broadcast address.",
"Learn this table: /24 = 254 hosts, /25 = 126, /26 = 62, /27 = 30, /28 = 14, /29 = 6, /30 = 2. A /31 is used on point-to-point links (2 addresses, no broadcast). Private ranges are 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16."],
k:["Block size = 256 − mask octet.","Usable hosts = 2^(host bits) − 2.","Network = first address. Broadcast = last address (next network − 1).","/27 = 32 block, 30 hosts. /28 = 16 block, 14 hosts. /30 = 4 block, 2 hosts."],
a:"Subnets are like egg cartons. The block size is how many eggs fit in one carton. You count cartons: 0, 32, 64, 96…",
lab:["Which subnet does 172.16.5.77/27 belong to, and what is its broadcast?",["172.16.5.64, broadcast 172.16.5.95","172.16.5.32, broadcast 172.16.5.63","172.16.5.77, broadcast 172.16.5.255","172.16.5.0, broadcast 172.16.5.31"],"/27 block = 32. Multiples: 0, 32, 64, 96. 77 is in 64–95."],
t:"Explain how to find the subnet and broadcast for an address using the block size.",
w:[["block","magic","256"],["broadcast","last"],["network address","first","subnet"]],
q:[["How many usable hosts are in a /28?",["14","16","30","6"],"2^4 = 16, minus 2 = 14."],
["What is the broadcast address of 10.1.1.130/26?",["10.1.1.191","10.1.1.255","10.1.1.127","10.1.1.192"],"Block 64: subnets 128–191. Broadcast is 191."],
["You need 25 hosts in one subnet with the fewest wasted addresses. Which prefix?",["/27","/28","/26","/24"],"/27 gives 30 hosts; /28 gives only 14."]]});
X('n020',"What is the network address of 192.168.10.200/29?",["192.168.10.200","192.168.10.192","192.168.10.196","192.168.10.208"],"Block size 8. 200 is a multiple of 8, so 200 is the network address.");
X('n020',"Which mask gives exactly 2 usable hosts for a traditional point-to-point link?",["255.255.255.252 (/30)","255.255.255.248 (/29)","255.255.255.0 (/24)","255.255.255.240 (/28)"],"/30 has 4 addresses: network, 2 hosts, broadcast.");
X('n020',"Which address is a private IPv4 address?",["172.20.1.1","172.32.1.1","8.8.8.8","192.169.1.1"],"Private ranges: 10/8, 172.16–172.31, and 192.168/16.");

L('n021',{h:"IPv6 addresses are long, but there are short-writing rules.",
p:["An IPv6 address has 128 bits. It is written as 8 groups of 4 hex digits, like 2001:0db8:0000:0000:0000:0000:0000:0001.",
"Two rules make it shorter. Rule 1: drop leading zeros in each group (0db8 becomes db8). Rule 2: replace one run of all-zero groups with :: (only once per address). So the example becomes 2001:db8::1.",
"Main types: Global unicast starts with 2 or 3 (2000::/3) and works on the internet. Unique local starts with fd (fc00::/7) and is private. Link-local starts with fe80 and works only on one link. Multicast starts with ff. IPv6 has no broadcast. A normal LAN uses a /64 prefix."],
k:["128 bits, 8 groups of hex.","Drop leading zeros. Use :: only once.","2000::/3 global, fc00::/7 unique local, fe80::/10 link-local, ff00::/8 multicast.","No broadcast in IPv6. LANs use /64."],
a:"Writing an IPv6 address short is like writing 007 as 7 — the meaning does not change.",
lab:["What is the shortest correct form of 2001:0db8:0000:0000:0001:0000:0000:0005?",["2001:db8::1:0:0:5","2001:db8::1::5","2001:db8:0:0:1::5:0","2001:db8:1:5"],":: may be used only once. Use it on one zero run and keep 0s in the other."],
t:"Explain the two rules for shortening IPv6 addresses and name the main address types.",
w:[["leading zero","zeros","zero"],["::","double colon","once"],["link-local","fe80","global","multicast"]],
q:[["How many bits are in an IPv6 address?",["128","32","64","48"],"IPv6 addresses are 128 bits long."],
["Which prefix is link-local?",["fe80::/10","2000::/3","ff00::/8","fc00::/7"],"Link-local addresses start with fe80."],
["Which is a valid way to write 2001:0db8:0000:0000:0000:0000:0000:0001?",["2001:db8::1","2001:db8:::1","2001::db8::1","2001.db8.1"],"Drop leading zeros and replace the zero run with :: once."]]});
X('n021',"Which IPv6 address type replaces IPv4 broadcast for one-to-many traffic?",["Multicast","Anycast","Link-local unicast","There is still broadcast in IPv6"],"IPv6 has no broadcast; it uses multicast.");
X('n021',"Which IPv6 address is a global unicast address?",["2001:db8:acad:1::10","fe80::1","ff02::1","fd00:1::1"],"Global unicast addresses are in 2000::/3.");

L('n022',{h:"A device can build its own IPv6 interface ID from its MAC address. This is EUI-64.",
p:["EUI-64 makes a 64-bit interface ID from a 48-bit MAC address. Step 1: split the MAC in half. Step 2: put FFFE in the middle. Step 3: flip the 7th bit of the first byte (add or remove 2 from the first byte's second hex digit).",
"Example: MAC 00:1A:2B:3C:4D:5E. Split: 001A2B | 3C4D5E. Insert FFFE: 001A2BFFFE3C4D5E. Flip bit: 00 becomes 02. Result: 021A:2BFF:FE3C:4D5E.",
"Every IPv6 interface gets a link-local address (fe80::) automatically. Routers use link-local addresses to talk to neighbors. On a Cisco router, type ipv6 unicast-routing to route IPv6, and ipv6 address 2001:db8:1:1::/64 eui-64 to use EUI-64."],
k:["EUI-64: split MAC, insert FFFE, flip the 7th bit.","Flipping the bit changes 00 to 02 (and 02 to 00).","Every IPv6 interface makes a link-local fe80:: address.","Command: ipv6 address <prefix>/64 eui-64."],
a:"EUI-64 is like making a locker number from your student ID: you split it, add a fixed middle part, and change one small mark.",
lab:["MAC address 0050.56AB.CDEF. What is the EUI-64 interface ID?",["0250:56FF:FEAB:CDEF","0050:56FF:FEAB:CDEF","0250:56AB:FFFE:CDEF","FFFE:0050:56AB:CDEF"],"Split 005056 | ABCDEF, insert FFFE, flip 00 to 02."],
t:"Explain the three steps of EUI-64 using an example MAC address.",
w:[["split","half","middle"],["fffe"],["flip","7th","seventh","bit","02"]],
q:[["What hex value is inserted in the middle during EUI-64?",["FFFE","FFFF","FE80","0000"],"EUI-64 inserts FFFE."],
["Which prefix does every IPv6 link-local address use?",["fe80::/10","2001::/16","ff02::/16","::1/128"],"Link-local addresses start with fe80."],
["Which command lets a Cisco router forward IPv6 packets?",["ipv6 unicast-routing","ip routing ipv6","ipv6 enable all","router ipv6"],"ipv6 unicast-routing turns on IPv6 routing."]]});
X('n022',"A router interface has MAC 0A00.1234.5678 and uses prefix 2001:db8:5::/64 with EUI-64. What is the interface ID?",["0800:12FF:FE34:5678","0A00:12FF:FE34:5678","0800:1234:FFFE:5678","0A02:12FF:FE34:5678"],"Flip bit 0x02 of the first byte: 0A becomes 08. Insert FFFE in the middle.");
X('n022',"Why do IPv6 routers use link-local addresses with their neighbors?",["Every IPv6 interface has one automatically and it only needs to work on that link","They are routed across the internet","They replace MAC addresses","They are required for IPv4"],"Link-local addresses are always present and local to the link.");

L('n023',{h:"Wi-Fi uses radio channels. In 2.4 GHz, use only channels 1, 6 and 11.",
p:["Wi-Fi uses radio bands. The 2.4 GHz band goes farther and passes walls better, but it has only 3 channels that do not overlap: 1, 6 and 11. The 5 GHz band has many more channels and is faster, but it does not go as far. Wi-Fi 6E adds the 6 GHz band.",
"Standards you should know: 802.11n (Wi-Fi 4, 2.4 and 5 GHz), 802.11ac (Wi-Fi 5, 5 GHz), 802.11ax (Wi-Fi 6/6E, 2.4, 5 and 6 GHz).",
"The SSID is the network name people see. One access point (AP) and its clients make a BSS. The BSSID is the AP radio's MAC address. Many APs with the same SSID make an ESS, so users can roam."],
k:["2.4 GHz non-overlapping channels: 1, 6, 11.","5 GHz = more channels, faster, shorter range.","SSID = network name. BSSID = AP radio MAC.","ESS = many APs, same SSID, users roam."],
a:"Radio channels are like lanes on a road. In 2.4 GHz, only lanes 1, 6 and 11 do not crash into each other.",
lab:["Three APs in a row all use 2.4 GHz. Which channel plan is best?",["1, 6 and 11","1, 2 and 3","6, 6 and 6","3, 7 and 9"],"Only 1, 6 and 11 do not overlap."],
t:"Explain the difference between the 2.4 GHz and 5 GHz bands and why we use channels 1, 6 and 11.",
w:[["2.4","2.4 ghz"],["5 ghz","5ghz","faster","more channels"],["1, 6","1 6 11","overlap","1,6,11"]],
q:[["Which 2.4 GHz channels do not overlap?",["1, 6 and 11","1, 5 and 9","2, 4 and 6","1, 7 and 13 only in the US"],"1, 6 and 11 are the standard non-overlapping channels."],
["What is an SSID?",["The name of the wireless network","The MAC address of a client","The encryption key","The radio channel number"],"The SSID is the network name."],
["Which band has more channels but a shorter range?",["5 GHz","2.4 GHz","900 MHz","Bluetooth"],"5 GHz has more channels; higher frequencies travel less far."]]});
X('n023',"A company uses several APs with the same SSID so users can walk around and stay connected. What is this called?",["An ESS (extended service set)","An IBSS","A single BSS","A PAN"],"Multiple APs sharing an SSID form an ESS.");
X('n023',"Which statement about 802.11ax (Wi-Fi 6E) is true?",["It can use the 6 GHz band","It only uses 2.4 GHz","It is older than 802.11n","It uses copper cable"],"Wi-Fi 6E extends 802.11ax into 6 GHz.");

L('n024',{h:"Good Wi-Fi needs a strong signal and low noise. SNR measures the gap.",
p:["Signal strength is measured in dBm. The numbers are negative. Closer to zero is stronger: −50 dBm is strong, −80 dBm is weak. About −67 dBm is a common target for voice and video.",
"SNR (signal-to-noise ratio) is signal minus noise. Signal −65 dBm and noise −90 dBm gives SNR 25 dB. Higher SNR is better.",
"Things that hurt Wi-Fi: walls, metal and water absorb or reflect signal. Microwave ovens and Bluetooth add noise in 2.4 GHz. Co-channel interference happens when nearby APs use the same channel and must take turns."],
k:["dBm is negative. Closer to 0 = stronger.","SNR = signal − noise. Higher is better.","Microwaves and Bluetooth interfere with 2.4 GHz.","Same channel on nearby APs = co-channel interference."],
a:"SNR is like talking at a party. Your voice is the signal; the crowd is the noise. You need your voice to be much louder than the crowd.",
lab:["Signal is −60 dBm and noise is −95 dBm. What is the SNR?",["35 dB","−155 dB","60 dB","95 dB"],"−60 − (−95) = 35 dB."],
t:"Explain what SNR means and how to calculate it, and name two causes of interference.",
w:[["snr","signal-to-noise","signal to noise"],["noise","interference","microwave"],["dbm","stronger","minus","subtract"]],
q:[["Which signal is strongest?",["−45 dBm","−70 dBm","−85 dBm","−95 dBm"],"Closer to zero is stronger."],
["Signal −70 dBm, noise −92 dBm. What is the SNR?",["22 dB","162 dB","−22 dB","70 dB"],"−70 − (−92) = 22."],
["Which device commonly interferes with 2.4 GHz Wi-Fi?",["A microwave oven","A fiber cable","A keyboard with a USB cable","A light switch"],"Microwave ovens operate near 2.4 GHz."]]});
X('n024',"Users near the break room lose Wi-Fi only at lunchtime. The AP uses 2.4 GHz. What is the likely cause?",["Microwave ovens adding interference","A duplex mismatch","DHCP snooping","An expired certificate"],"Microwaves create noise in 2.4 GHz.");
X('n024',"Which change improves SNR?",["Raising the signal or lowering the noise","Raising the noise","Using a longer SSID","Adding more clients"],"SNR is signal minus noise; raise one or lower the other.");

L('n025',{h:"Use WPA2 or WPA3. WEP and WPA are broken.",
p:["WEP is very old and can be cracked in minutes. Never use it. WPA used TKIP and is also weak.",
"WPA2 uses AES (with CCMP) and is strong. WPA3 is newer. WPA3-Personal uses SAE instead of a simple pre-shared key, which stops password-guessing attacks offline. WPA3 also requires Protected Management Frames.",
"Personal mode means everyone uses one shared password (PSK or SAE). Enterprise mode means each user logs in with their own account using 802.1X and a RADIUS server. Businesses should use Enterprise."],
k:["WEP and WPA/TKIP are insecure.","WPA2 = AES-CCMP. WPA3 = SAE and stronger protection.","Personal = one shared password. Enterprise = 802.1X + RADIUS, one login per user.","WPA3 requires protected management frames (PMF)."],
a:"Personal mode is one house key for the whole family. Enterprise mode is a badge for each worker that can be turned off by itself.",
lab:["A company wants each employee to log in to Wi-Fi with their own username and to disable a user who leaves. What should it use?",["WPA2 or WPA3 Enterprise with 802.1X and RADIUS","WEP with a long key","WPA2-Personal with one shared password","An open network"],"Enterprise mode gives each user their own login."],
t:"Explain the difference between Personal and Enterprise Wi-Fi security, and which protocols are safe.",
w:[["wpa2","wpa3","aes"],["enterprise","802.1x","radius"],["personal","psk","shared","password","sae"]],
q:[["Which Wi-Fi security is broken and must not be used?",["WEP","WPA2-AES","WPA3-SAE","WPA3-Enterprise"],"WEP can be cracked quickly."],
["What does WPA3-Personal use instead of a simple pre-shared key handshake?",["SAE","TKIP","WEP","Telnet"],"SAE protects against offline password guessing."],
["What does Enterprise mode use to check each user?",["802.1X with a RADIUS server","A single shared password","MAC address only","DHCP snooping"],"802.1X sends credentials to RADIUS."]]});
X('n025',"Which encryption does WPA2 use?",["AES with CCMP","TKIP only","RC4 with WEP","No encryption"],"WPA2 requires AES-CCMP.");
X('n025',"A café wants one password for guests, and the strongest personal option. Which should it choose?",["WPA3-Personal (SAE)","WEP","WPA with TKIP","Open with MAC filtering"],"WPA3-Personal is the strongest shared-password option.");

L('n026',{h:"When a user cannot connect, check in order: link, IP, gateway, DNS.",
p:["Use a simple order. Step 1: Is the link up (cable plugged in, Wi-Fi connected)? Step 2: Does the PC have a correct IP address and mask? Step 3: Can it ping its default gateway? Step 4: Can it reach a remote IP address? Step 5: Does DNS work (can it reach a name)?",
"Windows commands: ipconfig /all, ping, tracert, nslookup. Mac and Linux commands: ifconfig or ip addr, ping, traceroute, dig or nslookup.",
"If you can ping 8.8.8.8 but not www.example.com, the problem is DNS. If you cannot ping the gateway, the problem is local (cable, VLAN, IP settings)."],
k:["Order: link → IP → gateway → remote IP → DNS.","Ping by IP works but name fails = DNS problem.","Cannot ping the gateway = local problem.","Windows: ipconfig, tracert. Mac/Linux: ifconfig or ip addr, traceroute."],
a:"Fixing a network is like checking why a letter did not arrive: is the mailbox there, is the address right, did it reach the post office, did it leave town?",
lab:["A PC can ping 93.184.216.34 but not www.example.com. What is wrong?",["DNS","The cable","The default gateway","The switch VLAN"],"IP reachability works; only name resolution fails."],
t:"Explain the step-by-step order you use to troubleshoot a client that cannot connect.",
w:[["gateway","ping"],["dns","name","nslookup"],["ipconfig","ip address","ip addr","ifconfig"]],
q:[["A PC can reach a website by IP but not by name. What is the problem?",["DNS","The NIC driver","The cable","The subnet mask"],"Names need DNS."],
["Which Windows command traces the path to a destination?",["tracert","traceroute","show route","pathping-ios"],"Windows uses tracert; Linux and Cisco use traceroute."],
["A PC cannot ping its own default gateway. Where is the problem most likely?",["On the local network (cable, VLAN or IP settings)","On a server far away","In the DNS server","In the website"],"The gateway is local, so the problem is local."]]});
X('n026',"A Linux user wants to see the IP address of their interface. Which command works?",["ip addr","ipconfig /all","show ip interface brief","nslookup"],"ip addr (or ifconfig) shows Linux interface addresses.");
X('n026',"A help-desk tech checks a client: IP, mask and gateway are correct, the gateway answers ping, but remote websites by IP fail. What is the next thing to check?",["Routing or the internet path beyond the gateway","The cable","The DNS server","The Wi-Fi password"],"Local works; the problem is beyond the gateway.");

L('n027',{h:"DHCP asks by broadcast. Routers stop broadcasts. ip helper-address carries the request across.",
p:["DHCP has four steps: Discover, Offer, Request, Acknowledge (DORA). The client sends Discover as a broadcast because it has no address yet. DHCP uses UDP port 67 (server) and 68 (client).",
"Routers do not forward broadcasts. If the DHCP server is in another subnet, the router must relay the request. Put ip helper-address <server IP> on the router interface that faces the clients (their gateway interface).",
"A Cisco router can also be the DHCP server: ip dhcp excluded-address to protect fixed addresses, then ip dhcp pool NAME with network, default-router and dns-server. Check leases with show ip dhcp binding."],
k:["DORA: Discover, Offer, Request, Acknowledge.","DHCP: UDP 67 server, UDP 68 client.","ip helper-address goes on the client-facing (gateway) interface.","IOS server: excluded-address, pool, network, default-router, dns-server."],
a:"ip helper-address is like a school receptionist. A student shouts a question into the hall, and the receptionist phones the right office for them.",
lab:["PCs in VLAN 20 get 169.254 addresses. The DHCP server is 10.9.9.9 in another subnet. Where do you add ip helper-address 10.9.9.9?",["On the VLAN 20 gateway interface (for example interface vlan 20)","On the DHCP server","On every PC","On the internet interface"],"The relay goes on the interface that receives the client broadcasts."],
t:"Explain the four DHCP messages and why ip helper-address is needed.",
w:[["discover","offer","request","ack","dora"],["helper","relay"],["broadcast","router","subnet"]],
q:[["What does ip helper-address do?",["Relays DHCP broadcasts to a server in another subnet","Assigns a static IP to the router","Turns on DNS","Blocks DHCP"],"It turns the broadcast into a unicast to the server."],
["What is the correct order of DHCP messages?",["Discover, Offer, Request, Acknowledge","Offer, Discover, Acknowledge, Request","Request, Offer, Discover, Acknowledge","Discover, Request, Offer, Acknowledge"],"DORA."],
["Which IOS command shows the leases a router has handed out?",["show ip dhcp binding","show dhcp pool clients","show ip helper","show leases"],"show ip dhcp binding lists active leases."]]});
X('n027',"On an IOS DHCP pool, which command gives clients their default gateway?",["default-router","ip default-gateway","gateway-address","ip route 0.0.0.0"],"default-router sets the gateway in the DHCP pool.");
X('n027',"A router is the DHCP server for 192.168.1.0/24. The printers use 192.168.1.1–.10. What stops DHCP from giving those addresses away?",["ip dhcp excluded-address 192.168.1.1 192.168.1.10","no ip dhcp conflict","ip helper-address 192.168.1.10","dns-server 192.168.1.10"],"Excluded addresses are never leased.");
})();
