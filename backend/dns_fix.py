import socket
import dns.resolver

def patch_dns():
    """
    Patches socket.getaddrinfo to use Google DNS (8.8.8.8) 
    when the system DNS fails.
    """
    original_getaddrinfo = socket.getaddrinfo

    def google_dns_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        try:
            # Try system DNS first
            return original_getaddrinfo(host, port, family, type, proto, flags)
        except socket.gaierror:
            # If system fails, try Google DNS
            try:
                # We need to resolve the IP manually
                resolver = dns.resolver.Resolver()
                resolver.nameservers = ['8.8.8.8', '8.8.4.4']
                
                # Assume we want A records (IPv4) for now
                answers = resolver.resolve(host, 'A')
                ip_address = answers[0].to_text()
                
                print(f"✅ [DNS Patch] Resolved {host} to {ip_address} using Google DNS")
                
                # Now return the format getaddrinfo expects
                # (family, type, proto, canonname, sockaddr)
                # sockaddr is (ip, port) for IPv4
                return [(socket.AF_INET, type, proto, '', (ip_address, port))]
            except Exception as e:
                # If even that fails, raise the original error
                print(f"❌ [DNS Patch] Failed to resolve {host}: {e}")
                raise socket.gaierror(f"DNS lookup failed for {host}")

    # Apply the patch
    socket.getaddrinfo = google_dns_getaddrinfo
    print("🛡️ DNS Patcher: Active (Fallback to 8.8.8.8)")
