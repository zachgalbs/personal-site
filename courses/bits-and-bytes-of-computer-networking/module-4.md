---
title: Networking Services
course: The Bits and Bytes of Computer Networking
module: 4
provider: Coursera (Google)
---

# Module 4: Networking Services

## Name Resolution

Name resolution is referencing when you have a domain name and you need to find the corresponding IP address of that name so you can construct your IP datagram.

There are a few ways of resolving a domain name:

### 1. Host cache

Your device keeps a table of domain names --> IP addresses. If the requested domain name is already in your table you directly translate it to its IP address.

> *google.com has been recently visited: directly load the IP address*

### 2. Router cache

Your gateway router also keeps a cache for all the DNS resolutions its done for the devices on your network. This is usually a much larger table than your local cache, and prevents a full domain resolution.

### 3. Full lookup

Your gateway calls the DNS server provided by your ISP, which then runs a recursive resolution for that domain.

First, it visits the **root DNS server**, 13 servers operated by various organizations. From there, the root DNS server sends your recursive resolver back the IP address of one of a few **Top Level Domain** (TLD) servers, the one corresponding to the TLD in your domain name (the .com in google.com). The TLD server looks in its database for the IP address of Google's authoritative server, and then sends the IP of Google's server to your recursive resolver. Then your recursive resolver sends a new request to Google's authoritative server for the exact IP address of the domain name. Some program on Google's authoritative server searches for an A record for the request domain name. The A record simply defines the IP address that corresponds to the specific domain in the request. The IP address is then sent as a response back to the DNS server provided by the ISP, which then routes the IP address of the domain initially requested back to your gateway, which performs NAT to get the host on its network that sent the request in the first place. Your device gets the IP address, sends it to the socket running the program that requested the DNS in the first place (maybe Google Chrome or Safari). Now, Google Chrome has the IP address corresponding to the Domain Name they were searching for!

## DHCP

DHCP is the way that IP addresses are assigned on a local network. It's typically done by your router, but it doesn't have to be.

There are three ways DHCP gives out IP addresses: dynamic, automatic, and fixed. Dynamic allocation is where you have a set of IP addresses that are available to give out, and you **lease** them to devices on the network. This is usually done in a deterministic order, where the IP addresses are given out in ascending order of the range that's available. Automatic allocation is similar to dynamic allocation, but the server remembers past assignments and gives you the same address if possible. Fixed allocation is where the server uses a table with MAC addresses and corresponding IP addresses. New devices need to be manually configured to connect to the network.

## NAT

Network Address Translation is the process of translating between a private IP address and a public IP address. This works by giving every device on a network an IP address on a **reserved range** (192.168.x.x, 172.*16-31*.x.x, 10.x.x.x), and then when a request from a device needs to be sent outside the network, the private IP addresses is replaced with a public IP address, and the TCP segment is given a port on the router that corresponds to the device that sent the request on the network. This way, when traffic comes back with the same port on the public IP address, the router can send this traffic to the original device.

## VPNs and Proxies

VPNs allow you to access a local network from anywhere on the internet. The way this works is by setting up an **encrypted tunnel**. The far away device verifies its identity through public-private keys, and then some form of key exchange occurs so that both devices can get the same shared private symmetric key. Then, the remote device wraps future requests in an external, encrypted packet, that's stripped by the VPN gateway.

A proxy is just a server that makes requests or processes responses for a client. Forward proxies make requests for you and are used for things like anonymity and bypassing geographic restrictions. Reverse proxies are used for servers. They process tons of requests and can route requests to one of many servers depending on loads, or the contents of the request. Proxies are most commonly used for load balancing and content filtering.
