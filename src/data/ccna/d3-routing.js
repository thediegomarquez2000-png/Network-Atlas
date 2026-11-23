/* Domain 3.0 · IP routing (n041–n051) */
(function(){var L=window.ATLAS_CCNA.L,X=window.ATLAS_CCNA.X;

L('n041',{h:"The routing table is the router's map. Learn to read one line of it.",
p:["show ip route shows the routing table. Each line starts with a code. C = connected network. L = local (the router's own address, a /32). S = static route. O = OSPF route. An * means candidate default route.",
"Example: O 10.2.2.0/24 [110/2] via 10.0.0.2, 00:05:10, GigabitEthernet0/0. This means: learned by OSPF, network 10.2.2.0/24, administrative distance 110, metric 2, next hop 10.0.0.2, out of G0/0.",
"The gateway of last resort is the default route (0.0.0.0/0). The router uses it when no other route matches. If there is no match and no default route, the router drops the packet."],
k:["C = connected, L = local /32, S = static, O = OSPF.","[110/2] = [administrative distance / metric].","via = next-hop address.","Gateway of last resort = default route 0.0.0.0/0."],
a:"The routing table is like the signs at a highway junction: each sign says which road leads to which town.",
lab:["Line: S 172.16.0.0/16 [1/0] via 10.1.1.2. What is the next hop?",["10.1.1.2","172.16.0.0","1","0"],"via shows the next-hop address."],
t:"Explain how to read one line of the routing table, including the codes and the numbers in brackets.",
w:[["connected","static","ospf","code"],["distance","metric","bracket","[110"],["next hop","next-hop","via"]],
q:[["What does code L mean in the routing table?",["A local route: the router's own interface address","A link to the internet","A loopback only","A learned RIP route"],"L routes are /32 for the router's own IPs."],
["In [110/20], what is 110?",["Administrative distance","Metric","Hop count","VLAN"],"The first number is AD."],
["What does the router do with a packet that matches no route and there is no default route?",["Drops it","Floods it to all ports","Sends it back to the sender","Sends it to DNS"],"With no match, the packet is dropped."]]});
X('n041',"Routing table entry: O 192.168.50.0/24 [110/3] via 10.0.12.2, GigabitEthernet0/1. What is the metric?",["3","110","24","12"],"The second number in brackets is the metric (OSPF cost).");
X('n041',"What does Gateway of last resort is not set mean?",["There is no default route","OSPF is disabled","There are no connected networks","The router has no IP addresses"],"The gateway of last resort is the default route.");

L('n042',{h:"The router always picks the most specific route. The longest prefix wins.",
p:["A packet can match more than one route. The router picks the route with the longest prefix (the biggest /number). This is called longest prefix match.",
"Example: a packet to 10.1.1.5. Routes: 10.0.0.0/8, 10.1.0.0/16, 10.1.1.0/24 and 0.0.0.0/0. All match. The /24 is the longest, so it wins.",
"Longest prefix match is checked FIRST, before administrative distance and metric. AD only matters when two routes have the exact same prefix and length."],
k:["Longest prefix (most specific) wins.","Prefix length beats AD and metric.","0.0.0.0/0 matches everything but is the least specific.","A /32 host route is the most specific."],
a:"Longest prefix match is like mail sorting. A letter to '12 Oak Street, Springfield' goes to the Oak Street mailman, not just anyone in Springfield.",
lab:["Packet to 172.16.5.9. Routes: 172.16.0.0/16 via R1, 172.16.5.0/24 via R2, 0.0.0.0/0 via R3. Which is used?",["172.16.5.0/24 via R2","172.16.0.0/16 via R1","0.0.0.0/0 via R3","All three, load-balanced"],"/24 is the longest matching prefix."],
t:"Explain longest prefix match with an example and say when it is used compared to AD.",
w:[["longest","prefix","specific"],["match"],["/24","mask","bits"]],
q:[["Packet to 192.168.1.130. Routes: 192.168.1.0/24 and 192.168.1.128/25. Which wins?",["192.168.1.128/25","192.168.1.0/24","Both are used","Neither matches"],"Both match; /25 is longer."],
["What is checked first when picking a route?",["Longest prefix match","Administrative distance","Metric","Router uptime"],"Prefix length is first."],
["Which route matches every IPv4 address?",["0.0.0.0/0","255.255.255.255/32","127.0.0.0/8","10.0.0.0/8"],"The default route matches everything."]]});
X('n042',"Routes: S 10.10.0.0/16 [1/0] and O 10.10.10.0/24 [110/5]. A packet goes to 10.10.10.10. Which route is used?",["The OSPF /24 route","The static /16 route because AD 1 is lower","Both equally","Neither"],"Longest prefix match comes before AD.");
X('n042',"Packet to 10.5.5.5. Routes: 10.0.0.0/8, 10.5.0.0/16, 10.5.5.0/25, 10.5.5.128/25. Which is used?",["10.5.5.0/25","10.5.5.128/25","10.5.0.0/16","10.0.0.0/8"],"10.5.5.5 is in 10.5.5.0–10.5.5.127, the longest match.");

L('n043',{h:"Administrative distance is trust. Lower is better.",
p:["When two different sources (like static and OSPF) give a route to the exact same prefix, the router trusts the one with the lower administrative distance (AD).",
"Learn these AD values: connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, RIP 120, iBGP 200. AD 255 means 'do not trust' (never used).",
"The metric compares routes from the SAME protocol. OSPF uses cost (based on bandwidth). RIP uses hop count. Order to choose: 1) longest prefix, 2) lowest AD, 3) lowest metric."],
k:["Connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, RIP 120, iBGP 200.","Lower AD = more trusted.","Metric compares routes inside one protocol. OSPF metric = cost.","Order: prefix length → AD → metric."],
a:"AD is like trusting advice: your own eyes (connected) beat a friend's note (static), which beats a rumor (a routing protocol).",
lab:["The router learns 10.9.0.0/16 from OSPF and from RIP. Which goes into the table?",["The OSPF route (AD 110)","The RIP route (AD 120)","Both, load-balanced","Neither"],"Same prefix, so lower AD wins."],
t:"Explain administrative distance, list the common AD values, and explain how it is different from metric.",
w:[["administrative distance","ad","trust"],["metric","cost","hop"],["110","static","connected","lower"]],
q:[["What is the AD of OSPF?",["110","90","120","1"],"OSPF = 110."],
["What is the AD of a static route by default?",["1","0","5","110"],"Static = 1."],
["What does OSPF use as its metric?",["Cost","Hop count","Delay only","AD"],"OSPF uses cost."]]});
X('n043',"A router learns 192.168.10.0/24 from EIGRP (AD 90) and OSPF (AD 110). Which route is installed?",["The EIGRP route","The OSPF route","Both","The one with more hops"],"Same prefix, lowest AD wins.");
X('n043',"Two OSPF routes to the same /24 have cost 20 and cost 30. Which is used?",["Cost 20","Cost 30","Both, because AD is equal","Neither"],"Inside one protocol, the lower metric wins.");

L('n044',{h:"A static route is a route you type by hand: where to go, and how to get there.",
p:["Command: ip route <network> <mask> <next-hop or exit interface>. Example: ip route 192.168.2.0 255.255.255.0 10.0.0.2. This says: to reach 192.168.2.0/24, send to 10.0.0.2.",
"A default route catches everything else: ip route 0.0.0.0 0.0.0.0 203.0.113.1. It shows as S* and becomes the gateway of last resort.",
"Remember the return path! If R1 has a route to R2's LAN, R2 also needs a route back to R1's LAN, or replies get lost. A static route only goes into the table if its next hop is reachable or its exit interface is up."],
k:["ip route <network> <mask> <next-hop>.","Default route: ip route 0.0.0.0 0.0.0.0 <next-hop>.","Both directions need routes (the return path).","A host route uses mask 255.255.255.255 (/32)."],
a:"A static route is like writing directions on a sticky note: 'To get to the library, turn at the bakery.'",
lab:["R1 has ip route 10.2.2.0 255.255.255.0 10.0.0.2. PCs on R1's LAN can send to 10.2.2.0/24 but get no replies. What is missing?",["A route on R2 back to R1's LAN","A DNS server","A trunk","A bigger mask on R1"],"Traffic needs a route in both directions."],
t:"Explain how to write a static route and a default route, and why you need a return route.",
w:[["ip route"],["next hop","next-hop","exit interface"],["return","both","back","default"]],
q:[["Which command creates a default route via 10.1.1.1?",["ip route 0.0.0.0 0.0.0.0 10.1.1.1","ip route default 10.1.1.1","ip default-route 10.1.1.1","route 0.0.0.0 10.1.1.1"],"The default route uses 0.0.0.0 0.0.0.0."],
["Which code shows a static route in the routing table?",["S","O","C","D"],"S = static."],
["What mask is used for a host route to a single address?",["255.255.255.255","255.255.255.0","0.0.0.0","255.255.0.0"],"/32 = one address."]]});
X('n044',"Which command sends traffic for 172.16.20.0/24 to next hop 10.10.10.2?",["ip route 172.16.20.0 255.255.255.0 10.10.10.2","ip route 10.10.10.2 255.255.255.0 172.16.20.0","route add 172.16.20.0/24 10.10.10.2","ip route 172.16.20.0 0.0.0.255 10.10.10.2"],"Network, then mask, then next hop.");
X('n044',"A static route does not show in show ip route. Its next hop is 10.0.0.9, but no interface is in that subnet. Why?",["The next hop is not reachable, so the route is not installed","Static routes never show in the table","The AD is too low","The router needs DNS"],"Static routes need a reachable next hop.");

L('n045',{h:"IPv6 static routes look like IPv4 ones, but turn on IPv6 routing first.",
p:["First type ipv6 unicast-routing, or the router will not forward IPv6.",
"Command: ipv6 route <prefix/length> <next-hop>. Example: ipv6 route 2001:db8:2::/64 2001:db8:12::2. Default route: ipv6 route ::/0 2001:db8:12::2.",
"If the next hop is a link-local address (fe80::), you MUST also give the exit interface, because link-local addresses repeat on every link: ipv6 route ::/0 g0/0 fe80::2. Check with show ipv6 route."],
k:["ipv6 unicast-routing first.","ipv6 route <prefix/len> <next-hop>.","IPv6 default route = ::/0.","Link-local next hop needs the exit interface too."],
a:"A link-local next hop is like saying 'go to house number 2'. You must also say which street (the interface), because every street has a house 2.",
lab:["ipv6 route ::/0 fe80::1 is rejected. Why?",["A link-local next hop needs an exit interface","::/0 is not valid","IPv6 has no default route","fe80::1 is a multicast address"],"Use ipv6 route ::/0 g0/0 fe80::1."],
t:"Explain how to write an IPv6 static route and a default route, and the rule for link-local next hops.",
w:[["ipv6 route"],["unicast-routing","unicast routing"],["::/0","link-local","exit interface","fe80"]],
q:[["Which is the IPv6 default route prefix?",["::/0","::1/128","fe80::/10","0.0.0.0/0"],"::/0 matches all IPv6 addresses."],
["What must be enabled before a router forwards IPv6?",["ipv6 unicast-routing","ip routing","ipv6 enable on DNS","ospfv3"],"ipv6 unicast-routing turns on IPv6 forwarding."],
["Which command is correct with a link-local next hop?",["ipv6 route 2001:db8:5::/64 g0/1 fe80::5","ipv6 route 2001:db8:5::/64 fe80::5","ipv6 route fe80::5 2001:db8:5::/64","ip route 2001:db8:5::/64 fe80::5"],"Give the exit interface with a link-local next hop."]]});
X('n045',"Which command creates an IPv6 default route to next hop 2001:db8:0:1::1?",["ipv6 route ::/0 2001:db8:0:1::1","ipv6 route 0.0.0.0 0.0.0.0 2001:db8:0:1::1","ipv6 default 2001:db8:0:1::1","ipv6 route ::1/128 2001:db8:0:1::1"],"::/0 is the IPv6 default.");
X('n045',"Which command displays the IPv6 routing table?",["show ipv6 route","show ip route v6","show route ipv6","show ipv6 interface table"],"show ipv6 route.");

L('n046',{h:"A floating static route is a spare tire. It only appears when the main route fails.",
p:["You give a static route a higher AD than the main route. Example: the main path is learned by OSPF (AD 110). The backup: ip route 0.0.0.0 0.0.0.0 203.0.113.1 130.",
"While the OSPF route exists, AD 110 beats 130, so the backup stays hidden. If the OSPF route disappears, the backup 'floats' into the routing table.",
"The AD of the floating route must be HIGHER than the main route's AD. If you set 100 for a backup of OSPF, the static route would win all the time."],
k:["Floating static = static route with a higher AD.","Add the AD number at the end of ip route.","It must be higher than the primary route's AD.","It appears in the table only when the primary is gone."],
a:"A floating static route is a substitute player sitting on the bench. They only play when the main player leaves the game.",
lab:["Main route is OSPF (AD 110). Which backup command floats correctly?",["ip route 0.0.0.0 0.0.0.0 192.0.2.1 120","ip route 0.0.0.0 0.0.0.0 192.0.2.1 100","ip route 0.0.0.0 0.0.0.0 192.0.2.1 1","ip route 0.0.0.0 0.0.0.0 192.0.2.1 110 primary"],"The AD must be higher than 110."],
t:"Explain what a floating static route is and how to choose its AD.",
w:[["floating","backup"],["administrative distance","ad","higher"],["primary","main","fail"]],
q:[["What makes a static route 'floating'?",["A higher AD than the primary route","A lower AD than connected routes","A /32 mask","The word float"],"Higher AD keeps it hidden until needed."],
["Primary route is a static route (AD 1) to ISP A. Which AD works for the backup to ISP B?",["5","1","0","Any value lower than 1"],"Anything above 1 makes it float behind the primary."],
["When does a floating static route appear in show ip route?",["When the primary route is removed","Always","Never","Only after a reboot"],"It floats in when the better route is gone."]]});
X('n046',"R1 uses OSPF to reach 10.50.0.0/16. The engineer adds ip route 10.50.0.0 255.255.0.0 172.16.1.1 90 as a backup. What happens?",["The static route replaces OSPF right away because 90 is lower than 110","It works as a backup","It is rejected","It load-balances with OSPF"],"AD 90 beats 110, so it is not floating.");
X('n046',"Which command adds a floating default route with AD 200 via 198.51.100.1?",["ip route 0.0.0.0 0.0.0.0 198.51.100.1 200","ip route 0.0.0.0 0.0.0.0 200 198.51.100.1","ip route float 198.51.100.1 200","ip default-network 198.51.100.1 200"],"The AD goes at the end.");

L('n047',{h:"OSPF routers become neighbors first. Then they share maps and each one finds the best paths.",
p:["OSPF is a link-state routing protocol. Routers send Hellos, become neighbors, share their link-state information (LSAs), and run the SPF (Dijkstra) algorithm to find the best paths. Area 0 is the backbone area.",
"To become neighbors, these must MATCH: area number, subnet and mask, hello and dead timers (10 s and 40 s on Ethernet), authentication, and MTU (for FULL). Router IDs must be DIFFERENT. The process ID does NOT need to match.",
"Router ID choice: 1) the router-id command, 2) the highest loopback IP, 3) the highest active interface IP. Config: router ospf 1, network 10.0.0.0 0.0.0.255 area 0. Or on the interface: ip ospf 1 area 0. Check with show ip ospf neighbor. FULL means neighbors are done sharing."],
k:["Must match: area, subnet/mask, hello/dead timers, authentication, MTU.","Process ID does NOT need to match. Router IDs must be unique.","RID: router-id command → highest loopback → highest interface IP.","Healthy neighbor state = FULL (or 2-WAY between DROthers)."],
a:"OSPF neighbors are like pen pals. They must speak the same language (area, timers) before they trade maps of their towns.",
lab:["R1 uses router ospf 1, R2 uses router ospf 7. Same area, subnet and timers. Do they become neighbors?",["Yes, the process ID is local only","No, process IDs must match","Only if both use 1","Only on serial links"],"The process ID only matters on the local router."],
t:"Explain what must match for two OSPF routers to become neighbors and how the router ID is chosen.",
w:[["neighbor","hello","adjacency"],["area","timer","dead","subnet"],["router id","router-id","loopback"]],
q:[["Which OSPF setting does NOT need to match between neighbors?",["Process ID","Area","Hello timer","Subnet mask"],"Process IDs are locally significant."],
["What are the default OSPF hello and dead timers on Ethernet?",["10 and 40 seconds","30 and 120 seconds","5 and 15 seconds","60 and 180 seconds"],"Hello 10, dead 40."],
["Which neighbor state means OSPF has finished syncing?",["FULL","INIT","EXSTART","DOWN"],"FULL is the complete adjacency."]]});
X('n047',"A router has no router-id command. Loopback0 is 1.1.1.1, G0/0 is 10.0.0.1, G0/1 is 192.168.1.1. What is its OSPF router ID?",["1.1.1.1","192.168.1.1","10.0.0.1","0.0.0.0"],"Loopbacks are chosen before physical interfaces.");
X('n047',"Which network command puts every interface in 10.1.0.0/16 into OSPF area 0?",["network 10.1.0.0 0.0.255.255 area 0","network 10.1.0.0 255.255.0.0 area 0","network 10.1.0.0/16 area 0 all","ospf network 10.1.0.0 0.0.255.255"],"OSPF network commands use a wildcard mask.");
X('n047',"What is OSPF's default cost reference bandwidth, which makes 100 Mbps and 1 Gbps both cost 1?",["100 Mbps","1 Gbps","10 Mbps","10 Gbps"],"Cost = 100 Mbps ÷ interface bandwidth, minimum 1. Change it with auto-cost reference-bandwidth.");

L('n048',{h:"OSPFv3 is OSPF for IPv6. You turn it on per interface.",
p:["OSPFv3 routes IPv6. First type ipv6 unicast-routing. Then create the process: ipv6 router ospf 1, and router-id 1.1.1.1.",
"The router ID is still a 32-bit number written like an IPv4 address. If the router has no IPv4 addresses, you MUST set it by hand, or OSPFv3 will not start.",
"There is no network command. On each interface type: ipv6 ospf 1 area 0. OSPFv3 neighbors use link-local addresses, so next hops in show ipv6 route are fe80:: addresses. Check with show ipv6 ospf neighbor."],
k:["ipv6 unicast-routing first.","Enable per interface: ipv6 ospf <process> area <area>.","Router ID is 32-bit; set it manually if there is no IPv4 address.","Neighbors and next hops use link-local addresses."],
a:"OSPFv3 is the same game as OSPFv2 with new street addresses (IPv6). The player number (router ID) still uses the old format.",
lab:["An IPv6-only router will not start OSPFv3. What is missing?",["A manual router-id","A network command","An IPv4 default route","A DHCP pool"],"With no IPv4 address, the router ID must be set."],
t:"Explain how to turn on OSPFv3 and why the router ID may need to be set by hand.",
w:[["ospfv3","ipv6 ospf","ipv6 router ospf"],["router id","router-id","32"],["interface","link-local","area"]],
q:[["How do you enable OSPFv3 on an interface?",["ipv6 ospf 1 area 0","network 2001:db8::/64 area 0","ospf ipv6 enable","ipv6 router ospf area 0"],"OSPFv3 is enabled per interface."],
["What address type do OSPFv3 neighbors use as next hops?",["Link-local","Global unicast only","Multicast only","IPv4"],"Next hops are fe80:: addresses."],
["What format is the OSPFv3 router ID?",["A 32-bit dotted-decimal number","A 128-bit IPv6 address","A MAC address","A hostname"],"It is still 32 bits."]]});
X('n048',"Which command displays OSPFv3 neighbors?",["show ipv6 ospf neighbor","show ip ospf neighbor v6","show ospfv3 hosts","show ipv6 neighbors ospf"],"show ipv6 ospf neighbor.");
X('n048',"Which multicast address do OSPFv3 routers use to reach all OSPF routers?",["FF02::5","FF02::1","FF02::2","FE80::5"],"FF02::5 is all OSPF routers (FF02::6 is DR/BDR).");

L('n049',{h:"On Ethernet, OSPF picks a leader (DR) and a backup (BDR) to keep things tidy.",
p:["On a shared Ethernet segment, OSPF elects a Designated Router (DR) and a Backup DR (BDR). Other routers (DROthers) only fully sync with the DR and BDR. This cuts down on traffic.",
"Election: highest interface priority wins (default 1). Priority 0 means never become DR. If priorities tie, the highest router ID wins. The election is NOT preemptive: a new better router does not take over until the DR fails or OSPF is reset.",
"DROthers see each other in 2-WAY state. That is normal. On a point-to-point link there is no DR election. You can set it with ip ospf network point-to-point. Change priority with ip ospf priority 100."],
k:["Highest priority wins DR (default 1). Tie → highest router ID.","Priority 0 = never DR/BDR.","Not preemptive: the current DR stays until it fails.","DROther to DROther = 2-WAY (normal). Point-to-point = no DR."],
a:"The DR is like a class representative. Everyone tells the representative, and the representative tells everyone, instead of all students talking to each other.",
lab:["R1 priority 1, RID 3.3.3.3. R2 priority 50, RID 1.1.1.1. R3 priority 1, RID 9.9.9.9. They start together. Who becomes DR?",["R2, highest priority","R3, highest router ID","R1","No DR on Ethernet"],"Priority is checked before router ID."],
t:"Explain why OSPF elects a DR and BDR and how the election works.",
w:[["dr","designated"],["priority","router id","highest"],["bdr","backup","2-way","2way"]],
q:[["What interface priority stops a router from ever becoming DR?",["0","1","255","100"],"Priority 0 = never DR."],
["Two DROthers on the same segment show which neighbor state with each other?",["2-WAY","FULL","EXSTART","DOWN"],"DROthers stop at 2-WAY with each other."],
["A new router with priority 255 joins a segment that already has a DR. What happens?",["The current DR stays DR","The new router takes over right away","All routers reboot","The segment loses its BDR"],"The DR election is not preemptive."]]});
X('n049',"Which command makes OSPF skip the DR/BDR election on an Ethernet link between two routers?",["ip ospf network point-to-point","ip ospf priority 1","no ip ospf dr","ip ospf cost 0"],"Point-to-point network type has no DR.");
X('n049',"All OSPF routers on a LAN have priority 1. Which router becomes DR?",["The one with the highest router ID","The one with the lowest router ID","The one with the most interfaces","The one booted last"],"Ties are broken by highest router ID.");

L('n050',{h:"When OSPF fails, check the neighbor first. Then check what is advertised.",
p:["No neighbor at all? Check: area mismatch, hello/dead timer mismatch, different subnet or mask, authentication mismatch, duplicate router IDs, or a passive interface (passive-interface stops Hellos on that port).",
"Neighbor stuck in EXSTART or EXCHANGE? Usually an MTU mismatch. Stuck in INIT? The router hears Hellos but the other side does not hear its Hellos (one-way, often an ACL).",
"Neighbor FULL but routes are missing? The network may not be advertised (no network command or ip ospf area command for it). Useful commands: show ip ospf neighbor, show ip ospf interface brief, show ip protocols. To share a default route: default-information originate."],
k:["No neighbor: area, timers, subnet/mask, authentication, passive-interface, duplicate RID.","EXSTART/EXCHANGE stuck = MTU mismatch.","FULL but no routes = network not advertised.","default-information originate shares the default route."],
a:"Fixing OSPF is like fixing a phone call: first check that the call connects (neighbor), then check that people say the right things (routes).",
lab:["Two routers are stuck in EXSTART. Hello timers and areas match. One interface has MTU 1500 and the other 1400. Fix?",["Make the MTU match","Change the process ID","Make one interface passive","Change the router priority"],"MTU mismatch stops the database exchange."],
t:"Explain the common reasons an OSPF neighbor does not form and how you check them.",
w:[["neighbor","adjacency"],["mtu","timer","area","mismatch"],["passive","advertise","network"]],
q:[["Neighbors are stuck in EXSTART. What is the likely cause?",["MTU mismatch","Matching areas","Correct timers","Different process IDs"],"MTU mismatch stops at EXSTART/EXCHANGE."],
["What does passive-interface do in OSPF?",["Stops Hellos on that interface, so no neighbors form there","Makes the router the DR","Blocks all traffic","Turns off the interface"],"The network is still advertised, but no neighbors form."],
["Which command tells an OSPF router to advertise its default route to others?",["default-information originate","ip default-network","redistribute default","network 0.0.0.0 area 0 default"],"default-information originate shares the default route."]]});
X('n050',"R1 hello 10 / dead 40. R2 hello 5 / dead 20. Same area and subnet. What happens?",["They do not become neighbors","They become FULL","They become 2-WAY only","R2 becomes DR"],"Hello and dead timers must match.");
X('n050',"show ip ospf neighbor is empty. show ip ospf interface G0/0 shows the area as 1, while the neighbor's interface is in area 0. What is the fix?",["Put both interfaces in the same area","Change the process ID","Shorten the dead timer","Change the router ID to 0.0.0.0"],"Area IDs must match on a link.");

L('n051',{h:"HSRP and VRRP give hosts a backup default gateway with one shared virtual IP.",
p:["Hosts only have one default gateway. If that router dies, they are cut off. A First Hop Redundancy Protocol (FHRP) makes two routers share one virtual IP address and a virtual MAC. Hosts use the virtual IP as their gateway.",
"HSRP is Cisco's. One router is Active, the other is Standby. Highest priority wins (default 100). Preempt is OFF by default, so add standby 1 preempt if you want the better router to take back control. Commands: standby 1 ip 10.1.1.254, standby 1 priority 110. Check: show standby brief.",
"VRRP is the open standard. One router is Master, others are Backup. Default priority 100. Preempt is ON by default. HSRP version 1 virtual MAC: 0000.0c07.acXX (XX = group number in hex). VRRP virtual MAC: 0000.5e00.01XX."],
k:["FHRP = backup default gateway using a virtual IP.","HSRP (Cisco): Active/Standby, priority 100, preempt off by default.","VRRP (open standard): Master/Backup, priority 100, preempt on by default.","Hosts point their default gateway at the virtual IP."],
a:"HSRP is like a school with two principals sharing one office phone number. If one is out, the other answers the same number.",
lab:["R1 (priority 110) was Active and rebooted. R2 took over. R1 is back but R2 stays Active. Why?",["Preempt is not configured on R1","R1's priority is too high","VRRP is required","The virtual IP changed"],"HSRP preempt is off by default."],
t:"Explain why we need HSRP or VRRP and the difference between them.",
w:[["virtual","virtual ip","gateway"],["hsrp","active","standby"],["vrrp","master","preempt"]],
q:[["What do hosts use as their default gateway with HSRP?",["The virtual IP","The Active router's real IP","The Standby router's IP","The DNS server"],"Hosts point to the shared virtual IP."],
["What is the default HSRP priority?",["100","1","255","0"],"Default priority is 100."],
["Which FHRP is an open standard?",["VRRP","HSRP","GLBP","CDP"],"VRRP is IETF standard; HSRP and GLBP are Cisco."]]});
X('n051',"Which HSRP command lets a higher-priority router take back the Active role?",["standby 1 preempt","standby 1 active","standby 1 priority 0","standby 1 track"],"Preempt allows takeover.");
X('n051',"What is the HSRP version 1 virtual MAC for group 10?",["0000.0c07.ac0a","0000.0c07.ac10","0000.5e00.010a","0000.0c9f.f010"],"Group 10 in hex is 0a.");
})();
