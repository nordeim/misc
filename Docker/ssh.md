Exactly right — with the way you’ve run it, the container’s SSH port is bound to the host’s **0.0.0.0:2222**, which means it’s listening on **all interfaces** of the Docker host.  

That means:

- Any client on the same LAN can connect to the container’s SSH service by targeting the **host’s LAN IP** (`192.168.1.100`) and the mapped port (`2222`).  
- The command from another machine would be:

```bash
ssh -o PreferredAuthentications=password \
    -o PubkeyAuthentication=no \
    devuser@192.168.1.100 -p 2222
```

- You’ll log in with the credentials you set (`devuser` / `devpass`), unless you’ve hardened it with key-based auth.

---

## 🔐 Security considerations

Since you’ve exposed port 2222 on all interfaces:

- **LAN-wide access:** Any device on your LAN can attempt to connect.  
- **If the host is internet-facing:** This port would also be exposed externally unless you firewall it.  
- **Safer binding:** If you only want LAN access, you can bind explicitly to the LAN IP:

```bash
docker run -d -p 192.168.1.100:2222:22 --name claude-dev nordeim/alpine-dev-claude-dev:latest
```

- **For localhost-only access:**  
  ```bash
  docker run -d -p 127.0.0.1:2222:22 ...
  ```

---

## ✅ Summary

Yes — from any client on the same LAN, you can SSH into the container using:

```bash
ssh devuser@192.168.1.100 -p 2222
```

(with the extra `-o` flags if you want to force password auth and skip host key prompts).  

---

https://copilot.microsoft.com/shares/G6b32YtNjB7AttW6cHkfn
