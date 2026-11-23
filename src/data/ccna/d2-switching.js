/* Domain 2.0 · Switching & network access (n028–n040) */
(function(){var L=window.ATLAS_CCNA.L,X=window.ATLAS_CCNA.X;

L('n028',{h:"Cisco IOS has rooms. The prompt tells you which room you are in.",
p:["Router> is user EXEC mode. You can only look at a few things. Type enable to go to privileged EXEC mode: Router#. Here you can use all show commands.",
"Type configure terminal to enter global configuration mode: Router(config)#. Type interface g0/1 to enter interface mode: Router(config-if)#. Type exit to go back one level, or end to go straight back to Router#.",
"The running-config is the live configuration in RAM. It is lost when power goes off. The startup-config is saved in NVRAM. To save, type copy running-config startup-config (or write memory). Type ? for help, and press Tab to finish a word."],
k:["> = user EXEC. # = privileged EXEC (enable).","(config)# = global config (configure terminal).","running-config = RAM, lost on reboot. startup-config = NVRAM, kept.","Save: copy running-config startup-config."],
a:"IOS modes are like rooms in a house: the porch (>), the living room (#), the workshop (config) and a single workbench (interface).",
lab:["You changed a router's config. After a power cut, the changes are gone. What was missed?",["copy running-config startup-config","show running-config","enable","configure terminal"],"Changes live in RAM until you save them to NVRAM."],
t:"Explain the IOS modes and the difference between running-config and startup-config.",
w:[["enable","privileged","#"],["configure terminal","config","global"],["running","startup","save","nvram","copy"]],
q:[["Which command moves from Router> to Router#?",["enable","configure terminal","exit","login"],"enable enters privileged EXEC."],
["Where is the startup-config stored?",["NVRAM","RAM","Flash only as an IOS image","On the DNS server"],"startup-config is saved in NVRAM."],
["You are in Router(config-if)#. Which command takes you straight back to Router#?",["end","exit","disable","logout"],"end jumps back to privileged EXEC."]]});
X('n028',"An engineer wants to run show ip route while in global configuration mode without leaving it. What do they type?",["do show ip route","show ip route config","exit show ip route","run show ip route"],"The do keyword runs EXEC commands from config mode.");
X('n028',"Which prompt shows global configuration mode?",["Switch(config)#","Switch#","Switch>","Switch(config-if)#"],"(config)# is global configuration mode.");

L('n029',{h:"show ip interface brief tells you if a port is healthy. You want up/up.",
p:["show ip interface brief shows two columns: Status (layer 1) and Protocol (layer 2). up/up means the port works.",
"administratively down/down means someone typed shutdown. Fix: no shutdown. down/down means no physical link: check the cable and the other end. up/down means the cable is fine but layer 2 fails, for example a mismatch on a serial link.",
"err-disabled means the switch turned the port off because of a security rule (like port security or BPDU Guard). Fix the cause, then type shutdown and no shutdown. Speed and duplex should match on both ends."],
k:["up/up = working.","administratively down = shutdown command. Fix with no shutdown.","down/down = physical problem (cable, other side off).","up/down = layer 2 problem. err-disabled = turned off by a protection feature."],
a:"Status is 'is the road there?' Protocol is 'are cars driving on it?'",
lab:["G0/1 shows administratively down / down. What do you type in interface mode?",["no shutdown","shutdown","switchport mode access","ip routing"],"Administratively down means the port was shut down on purpose."],
t:"Explain what up/up, administratively down and down/down mean and how to fix each.",
w:[["up/up","up up","working"],["administratively","shutdown","no shutdown"],["down/down","cable","physical"]],
q:[["What does administratively down mean?",["The shutdown command was used on the interface","The cable is cut","DHCP failed","The VLAN is missing"],"It means it was disabled in the config."],
["A port shows err-disabled. What is a common reason?",["A port security or BPDU Guard violation","A good cable","A DNS error","An NTP update"],"Protection features put ports into err-disabled."],
["Which command gives a short table of interfaces with IPs and status?",["show ip interface brief","show running-config","show cdp","show version"],"show ip interface brief is the quick summary."]]});
X('n029',"Interface G0/0 shows Status: down, Protocol: down. The config does not have shutdown. What do you check first?",["The cable and the device on the other end","The DNS server","The OSPF area","The banner message"],"down/down without shutdown means no physical link.");
X('n029',"How do you bring back an err-disabled port after you fix the cause?",["shutdown, then no shutdown on the interface","reload the PC","delete the VLAN","clear ip route *"],"Bounce the interface to recover from err-disabled.");

L('n030',{h:"A VLAN splits one switch into several separate networks.",
p:["A VLAN (virtual LAN) is a group of switch ports that act like their own separate switch. Each VLAN is its own broadcast domain. A broadcast in VLAN 10 never reaches VLAN 20.",
"Hosts in different VLANs cannot talk unless a router or a layer 3 switch routes between them. Each VLAN usually gets its own IP subnet.",
"VLAN 1 is the default VLAN. All ports start in it. Normal VLANs are 1–1005 and extended VLANs are 1006–4094. Create a VLAN with vlan 10, then name SALES. Check with show vlan brief."],
k:["One VLAN = one broadcast domain = usually one subnet.","Different VLANs need a router (layer 3) to talk.","All ports start in VLAN 1.","show vlan brief lists VLANs and their access ports."],
a:"VLANs are like painting floor tiles in different colors in one big room. People only hear others standing on the same color.",
lab:["PC1 is in VLAN 10. PC2 is in VLAN 20 on the same switch. There is no router. Can they ping each other?",["No, different VLANs need a router","Yes, because they are on the same switch","Yes, if the cables are short","Only with a crossover cable"],"Separate VLANs are separate networks."],
t:"Explain what a VLAN is and why hosts in different VLANs need a router.",
w:[["vlan","virtual"],["broadcast","domain","separate"],["router","layer 3","route"]],
q:[["What does each VLAN create?",["A separate broadcast domain","A separate collision with the router","A new MAC address for each PC","A new DNS server"],"A VLAN is its own broadcast domain."],
["Which VLAN are all switch ports in by default?",["VLAN 1","VLAN 0","VLAN 99","VLAN 1005"],"VLAN 1 is the default."],
["Which command shows VLANs and the ports in them?",["show vlan brief","show ip route","show interfaces trunk only","show cdp neighbors"],"show vlan brief lists access ports per VLAN."]]});
X('n030',"Why do network teams split users into VLANs?",["To make smaller broadcast domains and separate groups for security","To make all broadcasts reach every device","To remove the need for IP addresses","To increase the size of each broadcast domain"],"VLANs reduce broadcasts and separate traffic.");
X('n030',"Which VLAN number range is called extended?",["1006–4094","1–1005","0–99","4095–8191"],"1006–4094 is the extended range.");

L('n031',{h:"An access port belongs to one data VLAN. A phone port can add one voice VLAN.",
p:["An access port connects to an end device like a PC or printer. It carries one VLAN without tags. Commands: switchport mode access, then switchport access vlan 10.",
"An IP phone often sits between the wall port and the PC. The switch can give the phone its own voice VLAN: switchport voice vlan 20. The phone tags its voice traffic with VLAN 20. The PC behind the phone sends untagged traffic in the data VLAN.",
"Cisco phones learn the voice VLAN from the switch through CDP. Putting voice in its own VLAN makes it easy to give voice higher priority (QoS)."],
k:["switchport mode access + switchport access vlan X.","switchport voice vlan Y for IP phones.","Phone voice = tagged in voice VLAN. PC data = untagged in access VLAN.","A separate voice VLAN helps QoS."],
a:"The voice VLAN is like a carpool lane on the same road. Phone calls get their own lane while normal traffic uses the regular lane.",
lab:["A phone and a PC share one switch port. Data should be VLAN 10 and voice VLAN 50. Which commands?",["switchport access vlan 10 and switchport voice vlan 50","switchport access vlan 50 and switchport voice vlan 10","switchport mode trunk only","vlan 10 50 shared"],"Access VLAN = data. Voice VLAN = phone."],
t:"Explain how one switch port can carry both a PC's data and an IP phone's voice.",
w:[["access","data"],["voice","phone"],["tag","802.1q","untagged","tagged"]],
q:[["Which command puts a port into VLAN 30 for a PC?",["switchport access vlan 30","vlan 30 access","switchport trunk vlan 30","ip vlan 30"],"switchport access vlan sets the data VLAN."],
["How is phone voice traffic sent on a voice VLAN port?",["Tagged with the voice VLAN ID","Untagged in VLAN 1","Over Bluetooth","Through the console port"],"The phone tags voice frames."],
["How does a Cisco phone learn its voice VLAN?",["From the switch through CDP","From DNS","From the user typing it","From NTP"],"CDP tells the phone the voice VLAN."]]});
X('n031',"Interface Fa0/5 config: switchport mode access, switchport access vlan 10, switchport voice vlan 110. A PC is plugged into the phone. Which VLAN does the PC's traffic use?",["VLAN 10","VLAN 110","VLAN 1","Both VLANs"],"The PC uses the access (data) VLAN.");
X('n031',"Why put IP phones in a separate voice VLAN?",["To separate and prioritize voice traffic","To stop phones from getting power","To avoid using IP addresses","To make the PC faster by turning off QoS"],"A voice VLAN makes QoS and security easier.");

L('n032',{h:"A trunk carries many VLANs on one cable. It adds a tag to show which VLAN.",
p:["A trunk link connects switch to switch (or switch to router). It carries many VLANs. 802.1Q adds a 4-byte tag to each frame. The tag holds the VLAN ID (12 bits, so up to 4094 VLANs).",
"The native VLAN is the one VLAN that is sent without a tag. By default it is VLAN 1. Both ends must use the same native VLAN, or traffic leaks between VLANs. CDP will warn you about a native VLAN mismatch.",
"Commands: switchport mode trunk, switchport trunk allowed vlan 10,20,30, switchport trunk native vlan 99. Check with show interfaces trunk. If a VLAN is not in the allowed list, it cannot cross the trunk. DTP can auto-form trunks; two ports set to dynamic auto will NOT form a trunk."],
k:["802.1Q tag = 4 bytes, holds the VLAN ID.","Native VLAN = untagged. Must match on both ends.","show interfaces trunk shows allowed and native VLANs.","dynamic auto + dynamic auto = no trunk. Set mode trunk to be sure."],
a:"A trunk is a bus with many passengers. Each passenger wears a colored badge (the tag) saying which VLAN they belong to.",
lab:["VLAN 30 hosts on SW1 cannot reach VLAN 30 hosts on SW2. show interfaces trunk shows allowed VLANs 10,20. What is wrong?",["VLAN 30 is not allowed on the trunk","VLAN 30 needs a crossover cable","The native VLAN must be 30","DNS is down"],"Add it: switchport trunk allowed vlan add 30."],
t:"Explain what a trunk does, what an 802.1Q tag is, and what the native VLAN is.",
w:[["trunk","many vlans","multiple"],["tag","802.1q","dot1q"],["native","untagged"]],
q:[["Which VLAN is sent untagged on an 802.1Q trunk?",["The native VLAN","VLAN 4094","The voice VLAN","All VLANs"],"Only the native VLAN is untagged."],
["Two switch ports are both set to dynamic auto. What happens?",["They stay access ports; no trunk forms","They form a trunk","They form an EtherChannel","They go err-disabled"],"Neither side starts the negotiation."],
["Which command adds VLAN 40 to an existing allowed list without removing others?",["switchport trunk allowed vlan add 40","switchport trunk allowed vlan 40","vlan 40 trunk","switchport access vlan 40"],"Without add, the list is replaced."]]});
X('n032',"CDP logs a message: native VLAN mismatch on G0/1 (1) with SW2 G0/1 (99). What is the fix?",["Set the same native VLAN on both ends","Shut down CDP","Change the trunk to access mode on one side only","Add more VLANs to the allowed list"],"Native VLANs must match on both ends of the trunk.");
X('n032',"How big is the 802.1Q tag added to a frame?",["4 bytes","2 bytes","12 bytes","64 bytes"],"802.1Q inserts a 4-byte tag.");

L('n033',{h:"To talk between VLANs, you need routing: a router-on-a-stick or a layer 3 switch with SVIs.",
p:["Router-on-a-stick: one router port connects to a switch trunk. The router uses subinterfaces, one per VLAN: interface g0/0.10, encapsulation dot1q 10, ip address 10.1.10.1 255.255.255.0. Each subinterface is the gateway for its VLAN.",
"Layer 3 switch: type ip routing. Then make an SVI (switch virtual interface) per VLAN: interface vlan 10, ip address 10.1.10.1 255.255.255.0, no shutdown. The SVI is the VLAN's gateway.",
"An SVI only comes up if the VLAN exists and at least one port in that VLAN (or a trunk carrying it) is up. A routed port is a switch port turned into a router port with no switchport."],
k:["Router-on-a-stick: subinterface + encapsulation dot1q <vlan> + IP.","Layer 3 switch: ip routing + interface vlan X (SVI).","SVI up needs: VLAN exists + an active port in it.","no switchport makes a routed port."],
a:"A router-on-a-stick is one door with many doorbells, one for each VLAN. An SVI is a built-in door for each VLAN inside the switch.",
lab:["A layer 3 switch has SVIs for VLAN 10 and 20, but hosts cannot reach the other VLAN. Their gateways are correct. What is missing?",["The ip routing command","switchport mode access","A DNS server","A crossover cable"],"Without ip routing, the switch does not route between SVIs."],
t:"Explain two ways to route between VLANs and the key commands for each.",
w:[["subinterface","router-on-a-stick","stick"],["svi","interface vlan"],["dot1q","encapsulation","ip routing"]],
q:[["Which command on a subinterface sets its VLAN?",["encapsulation dot1q 10","switchport access vlan 10","vlan 10","ip vlan 10"],"Subinterfaces use encapsulation dot1q."],
["What must be enabled on a layer 3 switch to route between SVIs?",["ip routing","ip cef off","switchport","cdp run"],"ip routing turns on layer 3 forwarding."],
["Interface vlan 30 stays down/down. What is a likely reason?",["No active port is in VLAN 30 (or VLAN 30 does not exist)","The SVI has an IP address","ip routing is on","The trunk is up"],"SVIs need the VLAN and an up port in it."]]});
X('n033',"In router-on-a-stick, what kind of link must the switch port to the router be?",["An 802.1Q trunk","An access port in VLAN 1","A routed port","A console link"],"The router needs tagged frames from many VLANs.");
X('n033',"Which command turns a layer 3 switch port into a routed port?",["no switchport","switchport mode routed","ip routing port","encapsulation dot1q"],"no switchport makes the port a layer 3 interface.");

L('n034',{h:"EtherChannel bundles several cables into one bigger logical link.",
p:["EtherChannel joins 2 to 8 physical links into one logical link (Port-channel). You get more bandwidth and backup if a cable fails. Spanning tree sees it as one link, so no ports are blocked.",
"LACP is the open standard (IEEE 802.3ad). Modes: active (asks) and passive (waits). active + active or active + passive works. passive + passive does NOT work. PAgP is Cisco-only: desirable (asks) and auto (waits). Mode on forces a channel with no negotiation.",
"All member ports must match: speed, duplex, access VLAN or trunk settings and allowed VLANs. Command: channel-group 1 mode active. Check with show etherchannel summary. Flag P = bundled, SU = layer 2 channel in use."],
k:["LACP: active/passive. PAgP: desirable/auto. Static: on.","passive + passive or auto + auto = no channel.","Members must match speed, duplex and VLAN settings.","show etherchannel summary: P = in bundle."],
a:"EtherChannel is like joining four lanes of a road into one highway. If one lane closes, cars use the others.",
lab:["SW1 ports use channel-group 1 mode passive. SW2 ports use channel-group 1 mode passive. What happens?",["No EtherChannel forms","An LACP EtherChannel forms","A PAgP EtherChannel forms","The ports go err-disabled always"],"Both sides wait. At least one side must be active."],
t:"Explain what EtherChannel does and which LACP mode combinations work.",
w:[["etherchannel","bundle","port-channel"],["lacp","active","passive"],["match","speed","same"]],
q:[["Which protocol is the open standard for EtherChannel?",["LACP","PAgP","CDP","DTP"],"LACP is IEEE 802.3ad."],
["Which pair forms an LACP channel?",["active and passive","passive and passive","auto and auto","on and active"],"At least one side must be active."],
["In show etherchannel summary, what does flag P mean?",["The port is bundled in the port-channel","The port is powered","The port is passive","The port is in VLAN 1"],"P = bundled in port-channel."]]});
X('n034',"Three ports join an EtherChannel but one shows as suspended (s). The other two are 1 Gbps; this one is 100 Mbps. Why?",["Member ports must have matching speed and settings","LACP needs exactly 3 ports","The port is in passive mode","The port-channel number is too high"],"Mismatched member settings get suspended.");
X('n034',"Why does spanning tree not block the extra links in an EtherChannel?",["It sees the bundle as one logical link","EtherChannel turns STP off on the switch","Each link is in a different VLAN","Spanning tree only runs on routers"],"The bundle appears as one interface to STP.");

L('n035',{h:"Power over Ethernet sends power and data in the same cable.",
p:["PoE lets a switch power devices through the Ethernet cable. Common powered devices (PDs) are IP phones, wireless access points and cameras. The switch is the PSE (power sourcing equipment).",
"Standards: 802.3af (PoE) gives up to 15.4 W per port. 802.3at (PoE+) gives up to 30 W. 802.3bt gives up to 60 W or 90 W. Cisco UPoE is up to 60 W.",
"Each switch has a total power budget. If the budget runs out, new devices do not get power. Check with show power inline. Network roles to know: endpoints (PCs, phones, IoT) and servers that provide services."],
k:["PSE = gives power (switch). PD = uses power (phone, AP, camera).","802.3af = 15.4 W. 802.3at (PoE+) = 30 W. 802.3bt = up to 90 W.","The switch has a total power budget.","show power inline shows power per port."],
a:"PoE is like a phone charger built into the cable, so the device needs no wall plug.",
lab:["New APs need 25 W each. The switch supports only 802.3af. What happens?",["The APs may not get enough power; use a PoE+ (802.3at) switch","Nothing, 802.3af gives 90 W","The APs work faster","The switch gives them DHCP instead"],"802.3af only gives 15.4 W per port."],
t:"Explain what PoE is, which devices use it, and how much power the main standards give.",
w:[["poe","power over ethernet","power"],["phone","access point","camera","ap"],["802.3af","802.3at","watt","budget"]],
q:[["Which standard is PoE+ (up to 30 W)?",["802.3at","802.3af","802.1Q","802.11ac"],"802.3at is PoE+."],
["In PoE, what is the switch called?",["PSE (power sourcing equipment)","PD (powered device)","SVI","AP"],"The switch sources the power."],
["Which command shows PoE use per port?",["show power inline","show poe vlan","show ip power","show cdp power"],"show power inline shows PoE status."]]});
X('n035',"A switch has a 370 W PoE budget. It already gives 360 W. A new 15 W camera is plugged in and does not power on. Why?",["The switch's PoE budget is used up","The camera needs DNS","The port is a trunk","The camera needs a crossover cable"],"The total budget is the limit.");
X('n035',"Which device is a typical PoE powered device?",["A wireless access point","A core router","A fiber patch panel","A DNS server in the cloud"],"APs, phones and cameras are common PDs.");

L('n036',{h:"CDP and LLDP let devices tell their neighbors who they are.",
p:["CDP (Cisco Discovery Protocol) is Cisco-only. It is on by default on Cisco devices. It sends every 60 seconds and keeps the info for 180 seconds. show cdp neighbors shows the neighbor's name, your local port, their port and model. show cdp neighbors detail also shows the neighbor's IP address and software version.",
"LLDP is the open standard (IEEE 802.1AB). It works with other vendors. On many Cisco devices it is off by default. Turn it on with lldp run. Timers: every 30 seconds, hold 120 seconds.",
"Both are very useful for drawing a network map. But they give away information, so turn them off on ports that face users or the internet: no cdp enable on that interface."],
k:["CDP = Cisco only, on by default, 60 s / 180 s.","LLDP = open standard 802.1AB, lldp run, 30 s / 120 s.","show cdp neighbors detail shows the neighbor's IP and version.","Disable on untrusted ports for security."],
a:"CDP and LLDP are like name tags at a meeting. Each device shows its name and where it is plugged in.",
lab:["You need to find the IP address of the switch connected to your G0/1. Which command helps?",["show cdp neighbors detail","show cdp neighbors","show vlan brief","show ip dhcp binding"],"The detail view includes the neighbor's IP."],
t:"Explain what CDP and LLDP do and how they are different.",
w:[["cdp","cisco"],["lldp","open","standard","802.1ab"],["neighbor","discover","device"]],
q:[["Which discovery protocol is an open standard?",["LLDP","CDP","PAgP","HSRP"],"LLDP is IEEE 802.1AB."],
["Which command turns on LLDP globally?",["lldp run","lldp enable","cdp run lldp","enable lldp"],"lldp run enables LLDP."],
["Why disable CDP on a port facing the internet?",["It reveals device information to strangers","It slows down DNS","It blocks DHCP","It causes duplex mismatches"],"CDP advertises model, version and IP."]]});
X('n036',"Your Cisco switch connects to another vendor's switch. Which protocol should you use to discover it?",["LLDP","CDP","DTP","VTP"],"Other vendors support LLDP.");
X('n036',"What is CDP's default advertisement timer?",["60 seconds","30 seconds","10 seconds","180 seconds"],"CDP sends every 60 s; holdtime is 180 s.");

L('n037',{h:"Ping checks if you can reach something. Traceroute shows the path. Captures show the actual packets.",
p:["Ping sends ICMP echo requests and waits for echo replies. On Cisco IOS, ! means a reply, . means a timeout, and U means unreachable. The first ping often shows .!!!! because the router first needs ARP.",
"Traceroute shows each router (hop) on the way. It uses TTL: the first packet dies at router 1, the next at router 2, and so on. Each router sends back an error, which reveals it. A * means no answer for that hop.",
"To see actual packets, use Wireshark. On a switch, a SPAN session copies traffic from one port to another port where your capture PC is: monitor session 1 source interface g0/1 and monitor session 1 destination interface g0/2."],
k:["IOS ping: ! = reply, . = timeout, U = unreachable.",".!!!! on the first try is normal (ARP).","Traceroute uses increasing TTL to find each hop.","SPAN copies a port's traffic to a capture port."],
a:"Ping is knocking on a door. Traceroute is writing down every street sign on the way there.",
lab:["A traceroute stops showing replies after hop 3 (only * * *). What does this tell you?",["The problem is likely at or just after hop 3","The DNS server is wrong","The PC has no IP address","Everything is fine"],"Traceroute shows where packets stop getting answers."],
t:"Explain the difference between ping and traceroute and how to capture traffic on a switch.",
w:[["ping","icmp","echo"],["traceroute","tracert","ttl","hop"],["capture","wireshark","span"]],
q:[["In IOS ping output, what does . mean?",["Timeout, no reply","Success","Unreachable","Fragmented"],". = no reply in time."],
["Why does the first ping often show .!!!!?",["The first packet waits for ARP","The cable is bad","DNS is slow","The router is rebooting"],"ARP resolution delays the first packet."],
["Which switch feature copies traffic to a port for capture?",["SPAN (port mirroring)","CDP","PoE","DTP"],"SPAN mirrors traffic to a destination port."]]});
X('n037',"Which field does traceroute increase by 1 for each probe set to find each router?",["TTL","Source port only","VLAN ID","Window size"],"Each router decreases TTL and replies when it reaches 0.");
X('n037',"An IOS ping returns UUUUU. What does this mean?",["A router sent back destination unreachable messages","All pings succeeded","The interface is shut down locally","DNS failed"],"U is an ICMP unreachable reply.");

L('n038',{h:"Spanning tree stops loops by blocking extra paths. The lowest bridge ID becomes root.",
p:["Switches with extra links can make loops. Frames go around forever (a broadcast storm). Spanning Tree Protocol (STP) blocks some ports to stop loops. Rapid PVST+ is Cisco's fast version that runs one tree per VLAN.",
"Step 1: elect the root bridge. Lowest bridge ID wins. Bridge ID = priority (default 32768 plus the VLAN number) + MAC address. If priority ties, the lowest MAC wins. Priority must be a multiple of 4096.",
"Step 2: every other switch picks one root port (the best path to root, lowest cost). Step 3: each link gets one designated port. Other ports become alternate (blocked). Costs: 10 Gbps = 2, 1 Gbps = 4, 100 Mbps = 19. All ports on the root bridge are designated."],
k:["Root bridge = lowest bridge ID (priority, then MAC).","Default priority 32768 + VLAN ID. Change in steps of 4096.","Root port = best path to root. Designated port = one per link. Alternate = blocked backup.","Cost: 1 Gbps = 4, 100 Mbps = 19, 10 Gbps = 2."],
a:"STP is like closing some doors in a building with too many hallways, so people do not walk in circles forever.",
lab:["SW1 priority 32769, MAC 0000.1111.1111. SW2 priority 32769, MAC 0000.0000.2222. Which is root for VLAN 1?",["SW2, because the priorities tie and its MAC is lower","SW1, because it was turned on first","Both","Neither"],"Same priority, so the lowest MAC wins."],
t:"Explain how STP elects the root bridge and what root, designated and alternate ports are.",
w:[["root","bridge id","priority"],["lowest","mac"],["block","loop","alternate"]],
q:[["What is the default STP priority value before the VLAN is added?",["32768","4096","0","65535"],"Default priority is 32768."],
["Which command makes a switch the root for VLAN 10?",["spanning-tree vlan 10 root primary","spanning-tree root 10","stp priority 10","spanning-tree vlan 10 cost 0"],"root primary lowers the priority automatically."],
["What is the STP cost of a 1 Gbps link (short method)?",["4","19","2","100"],"1 Gbps = 4."]]});
X('n038',"Which port role is the single best path from a non-root switch toward the root bridge?",["Root port","Designated port","Alternate port","Edge port"],"Every non-root switch has one root port.");
X('n038',"Which priority value can you configure on a switch for STP?",["8192","8000","10000","33000"],"Priority must be a multiple of 4096.");
X('n038',"What are the Rapid PVST+ port states?",["Discarding, learning, forwarding","Blocking, listening, learning, forwarding, disabled","Up, down, err-disabled","Active, standby, listen"],"RSTP uses discarding, learning and forwarding.");

L('n039',{h:"Protect spanning tree on user ports with PortFast and BPDU Guard.",
p:["PortFast lets a port that connects to a PC or server go straight to forwarding. Without it, the user waits while STP checks for loops. Use PortFast only on edge ports (ports to end devices), never to another switch.",
"BPDU Guard protects PortFast ports. If a BPDU (a switch message) arrives on that port, someone plugged in a switch. BPDU Guard puts the port into err-disabled to stop a loop.",
"Root Guard stops a switch on that port from becoming root. If it sends a better BPDU, the port goes root-inconsistent (blocked) until it stops. Commands: spanning-tree portfast, spanning-tree bpduguard enable, spanning-tree guard root. Global defaults: spanning-tree portfast default and spanning-tree portfast bpduguard default."],
k:["PortFast = edge ports go to forwarding right away.","BPDU Guard = err-disable a PortFast port that receives a BPDU.","Root Guard = stop a port from accepting a better root.","Only use PortFast on ports to end devices."],
a:"PortFast is a fast lane for trusted visitors. BPDU Guard is the guard who closes the lane if a truck (a switch) tries to use it.",
lab:["A user plugs a small home switch into an office port with BPDU Guard. What happens?",["The port goes err-disabled","The home switch becomes root","Nothing happens","The port becomes a trunk"],"BPDU Guard shuts the port when it sees a BPDU."],
t:"Explain what PortFast, BPDU Guard and Root Guard do and where to use them.",
w:[["portfast","edge"],["bpdu guard","bpduguard","err-disabled","err-disable"],["root guard","root"]],
q:[["Where should you enable PortFast?",["On ports connected to end devices","On trunk links between switches","On every port including uplinks","Only on the root bridge"],"PortFast is for edge ports."],
["What does BPDU Guard do when a BPDU arrives?",["Puts the port into err-disabled","Makes the port the root port","Turns on PoE","Sends the BPDU to DHCP"],"It shuts the port to prevent loops."],
["Which feature stops a downstream switch from becoming root?",["Root Guard","PortFast","CDP","PoE"],"Root Guard ignores superior BPDUs on that port."]]});
X('n039',"Which global command enables BPDU Guard on all PortFast ports?",["spanning-tree portfast bpduguard default","spanning-tree bpduguard all","bpduguard enable global","spanning-tree guard bpdu"],"This enables BPDU Guard on every PortFast-enabled port.");
X('n039',"A port shows root-inconsistent. Which feature caused this?",["Root Guard","BPDU Guard","Port security","DHCP snooping"],"Root Guard puts ports into root-inconsistent state.");

L('n040',{h:"For layer 2 problems, follow the frame: port, VLAN, trunk, spanning tree, MAC table.",
p:["Check 1: Is the port up/up? (show interfaces status or show ip interface brief). Check 2: Is the port in the right VLAN? (show vlan brief). Check 3: Does the trunk allow the VLAN, and do native VLANs match? (show interfaces trunk).",
"Check 4: Is spanning tree blocking the path? (show spanning-tree vlan 10). Check 5: Did the switch learn the host's MAC? (show mac address-table). If a MAC is learned on the wrong port, a cable may be in the wrong place.",
"Also look for err-disabled ports (port security, BPDU Guard) and duplex mismatches. Fix one thing at a time, then test again."],
k:["show interfaces status, show vlan brief, show interfaces trunk.","show spanning-tree vlan X shows blocked ports.","show mac address-table shows where each MAC was learned.","Fix one thing, then test."],
a:"Finding a layer 2 problem is like following a package's tracking: check each stop until you find where it got stuck.",
lab:["Two PCs in VLAN 20 on different switches cannot ping. Ports are up and in VLAN 20. What do you check next?",["show interfaces trunk to see if VLAN 20 is allowed","The DNS server","The website certificate","show ip route on the PC"],"After the access ports, check the trunk."],
t:"Explain the order of checks you use to troubleshoot a layer 2 problem and the commands for each.",
w:[["vlan","show vlan"],["trunk","allowed","native"],["mac address-table","mac table","spanning","stp"]],
q:[["Which command shows which port a MAC address was learned on?",["show mac address-table","show arp","show cdp","show ip route"],"The MAC table maps MACs to ports."],
["Which command shows the allowed VLANs on trunks?",["show interfaces trunk","show vlan trunk-only","show running-config vlan","show ip interface brief"],"show interfaces trunk lists allowed and native VLANs."],
["A PC's port is in VLAN 1, but it should be in VLAN 10. What fixes it?",["switchport access vlan 10 on that port","vlan 1 delete","ip routing","no shutdown on VLAN 10"],"Assign the right access VLAN."]]});
X('n040',"A host's MAC appears in the MAC table, but on the wrong VLAN. What is the likely problem?",["The access port is assigned to the wrong VLAN","The default gateway is wrong","The DNS server is missing","The fiber is single-mode"],"The switch learns MACs in the port's VLAN.");
X('n040',"Users in VLAN 30 lose connectivity across a link. show spanning-tree vlan 30 shows that port as Altn BLK. What does this mean?",["STP is blocking that port for VLAN 30 to prevent a loop","The port is err-disabled","The trunk is down","The VLAN does not exist"],"Alternate blocking ports are a normal STP loop prevention state; traffic should take another path.");
})();
