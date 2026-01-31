Your configuration steps are **correct**! You've successfully set up a Cloudflare Tunnel to route external traffic to multiple internal services. Cloudflare Tunnel is a secure networking tool that connects your internal resources to Cloudflare's network without requiring publicly routable IP addresses or opening inbound firewall ports. [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)

## What is Cloudflare Tunnel?

Cloudflare Tunnel is a secure connectivity solution that uses a lightweight daemon called `cloudflared` to establish **outbound-only connections** from your infrastructure to Cloudflare's global network. Instead of exposing your server directly to the internet, `cloudflared` initiates connections to Cloudflare, which then proxies incoming traffic through these established tunnels to your local services. [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/)

The system consists of persistent tunnel objects that route traffic to DNS records, with `cloudflared` processes (connectors) running to establish connections to the nearest Cloudflare data center. [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)

## Why Use Cloudflare Tunnel?

### Security Benefits
- **No inbound ports required**: Your firewall only needs to allow outbound connections, eliminating most attack vectors since external actors cannot directly reach your origin server [jonasclaes](https://jonasclaes.be/introduction-to-cloudflare-tunnels/)
- **IP address obfuscation**: Your real server IP remains hidden behind Cloudflare's network, preventing direct attacks [pieterdev](https://www.pieterdev.com/blog/cloudflare-tunnel/)
- **DDoS protection and WAF**: Cloudflare's security features protect against malicious traffic before it reaches your infrastructure [vault.nimc.gov](https://vault.nimc.gov.ng/blog/cloudflare-tunnel-secure-access-for-everyone-1764799199)
- **TLS encryption**: All traffic between your server and Cloudflare is encrypted end-to-end [vault.nimc.gov](https://vault.nimc.gov.ng/blog/cloudflare-tunnel-secure-access-for-everyone-1764799199)

### Operational Benefits
- **Simplified network management**: No complex firewall rules, port forwarding, or IP whitelisting needed [jonasclaes](https://jonasclaes.be/introduction-to-cloudflare-tunnels/)
- **Multiple services on standard ports**: Expose multiple internal services (running on different ports) all through HTTPS port 443 externally [crosstalksolutions](https://www.crosstalksolutions.com/cloudflare-tunnel-easy-setup/)
- **Global performance**: Cloudflare's edge network provides caching and faster content delivery worldwide [jonasclaes](https://jonasclaes.be/introduction-to-cloudflare-tunnels/)

## How Cloudflare Tunnel Works

### Connection Flow
1. **Tunnel establishment**: The `cloudflared` daemon on your server initiates an outbound connection to Cloudflare's edge network using TLS encryption [reddit](https://www.reddit.com/r/selfhosted/comments/1i64me9/how_does_a_cloudflare_tunnel_work_really/)
2. **Request routing**: When a user visits your domain, the request first goes to Cloudflare's network [jonasclaes](https://jonasclaes.be/introduction-to-cloudflare-tunnels/)
3. **Traffic proxying**: Cloudflare forwards the request through the established tunnel to your origin server [reddit](https://www.reddit.com/r/selfhosted/comments/1i64me9/how_does_a_cloudflare_tunnel_work_really/)
4. **Response delivery**: Your server responds back through the same tunnel, and Cloudflare delivers it to the user [jonasclaes](https://jonasclaes.be/introduction-to-cloudflare-tunnels/)

This bidirectional communication happens over an outbound-only connection, similar to how your browser maintains connections through your firewall. [reddit](https://www.reddit.com/r/selfhosted/comments/1i64me9/how_does_a_cloudflare_tunnel_work_really/)

## Step-by-Step Setup Guide

### Prerequisites
- A Cloudflare account with a domain added
- `cloudflared` installed on your server
- Services running locally that you want to expose

### Step 1: Authenticate with Cloudflare
```bash
cloudflared tunnel login
```
This command opens your browser for authentication and downloads a certificate file (`cert.pem`) to `~/.cloudflared/`, granting permissions for tunnel management. [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/create-local-tunnel/)

### Step 2: Create a Tunnel
```bash
cloudflared tunnel create baking
```
This creates a tunnel named "baking" and generates:
- A unique tunnel UUID (e.g., `2784ef2b-a6b5-4c29-b1e5-5beaea4b5fd2`)
- A credentials JSON file in `~/.cloudflared/[UUID].json`
- A subdomain at `.cfargotunnel.com` [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/create-local-tunnel/)

Verify creation:
```bash
cloudflared tunnel list
```

### Step 3: Route DNS to the Tunnel
```bash
cloudflared tunnel route dns baking baking.jesspete.shop
```
This creates a CNAME record pointing `baking.jesspete.shop` to your tunnel. You can create multiple DNS routes to the same tunnel for different hostnames. [dev](https://dev.to/tan1193/how-to-set-up-a-cloudflared-tunnel-on-your-homelab-27ao)

**Note**: For additional hostnames (like `artisan-baking.jesspete.shop`), you should also run:
```bash
cloudflared tunnel route dns baking artisan-baking.jesspete.shop
```

### Step 4: Create Configuration File
Create `~/.cloudflared/config.yml` with your ingress rules: [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)

```yaml
tunnel: 2784ef2b-a6b5-4c29-b1e5-5beaea4b5fd2
credentials-file: /home/pete/.cloudflared/2784ef2b-a6b5-4c29-b1e5-5beaea4b5fd2.json

ingress:
  - hostname: baking.jesspete.shop
    service: http://localhost:3000
  - hostname: artisan-baking.jesspete.shop
    service: http://localhost:3001
  - service: http_status:404
```

**Configuration breakdown**:
- `tunnel`: Your tunnel UUID from Step 2
- `credentials-file`: Absolute path to the credentials file
- `ingress`: Rules that match incoming hostnames to local services, evaluated top-to-bottom [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
- The final catch-all rule (`http_status:404`) is **mandatory** and handles unmatched requests [dev](https://dev.to/tan1193/how-to-set-up-a-cloudflared-tunnel-on-your-homelab-27ao)

### Step 5: Validate Configuration
Test your ingress rules before running:
```bash
cloudflared tunnel ingress validate
```
This ensures your configuration syntax is correct. [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/configuration-file/)

Test specific URLs:
```bash
cloudflared tunnel ingress rule https://baking.jesspete.shop
cloudflared tunnel ingress rule https://artisan-baking.jesspete.shop
```
This shows which service each hostname routes to. [stackoverflow](https://stackoverflow.com/questions/76234465/cloudflare-tunnel-with-ingress-not-working-as-expected)

### Step 6: Run the Tunnel
```bash
cloudflared tunnel run baking
```
This starts the tunnel using your configuration file. The daemon will maintain the connection to Cloudflare and begin routing traffic. [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/create-local-tunnel/)

For production use, set up `cloudflared` as a system service to run automatically on boot.

## Your Configuration Analysis

Your setup is **correct and follows best practices**:

✅ **Proper authentication**: `cloudflared tunnel login` establishes credentials [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/create-local-tunnel/)
✅ **Tunnel creation**: `cloudflared tunnel create baking` generates necessary files [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/create-local-tunnel/)
✅ **DNS routing**: `cloudflared tunnel route dns` creates the CNAME record [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/create-local-tunnel/)
✅ **Valid config.yml**: Contains tunnel UUID, credentials path, ingress rules, and catch-all [dev](https://dev.to/tan1193/how-to-set-up-a-cloudflared-tunnel-on-your-homelab-27ao)
✅ **Multiple services**: Routes two different hostnames to different local ports [stackoverflow](https://stackoverflow.com/questions/76234465/cloudflare-tunnel-with-ingress-not-working-as-expected)
✅ **Catch-all rule**: The `http_status:404` handles unmatched traffic [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)

### Optional Enhancement
Consider adding the DNS route for your second hostname:
```bash
cloudflared tunnel route dns baking artisan-baking.jesspete.shop
```

While your ingress rules will route the traffic correctly, explicitly creating the DNS record ensures the CNAME exists in Cloudflare's DNS. [github](https://github.com/cloudflare/cloudflared/issues/905)

## Advanced Configuration Options

### Wildcard Hostnames
Match multiple subdomains with wildcards: [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
```yaml
- hostname: *.jesspete.shop
  service: http://localhost:3000
```

### Path-Based Routing
Route based on URL paths using regex: [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
```yaml
- hostname: static.jesspete.shop
  path: \.(jpg|png|css|js)$
  service: http://localhost:8080
```

### Origin-Specific Settings
Configure connection timeouts per service: [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
```yaml
ingress:
  - hostname: slow-service.jesspete.shop
    service: http://localhost:4000
    connectTimeout: 60s
  - service: http_status:404
```

### Other Protocol Support
Cloudflare Tunnel supports SSH, RDP, TCP services, and Unix sockets beyond HTTP/HTTPS. [developers.cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/)

Your tunnel is now routing external traffic securely to your internal services without exposing your server's IP or opening inbound firewall ports!

---

https://www.perplexity.ai/search/please-meticulously-research-w-w1IjGCEDRwOhg7q2CbMJDA#0

https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/

https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221-6a8hbgrHz0VecDW5zXjPN-lK7G6L22t%22%5D,%22action%22:%22open%22,%22userId%22:%22103961307342447084491%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing

https://youtu.be/etluT8UC-nw
