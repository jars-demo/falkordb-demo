Incident report IR-2042 (fictional)

On 14 March, the security team at Lumen Health detected unusual traffic from the web server
web-01. Priya Nair, the on-call security analyst, traced it to an exploit of the Log4Shell
vulnerability (CVE-2021-44228) in the web server's logging library.

From web-01, the attacker moved to the application server app-02, which runs the same vulnerable
library. app-02 has network access to customer-db, the database that stores patient billing
records. Marco Rossi, the database administrator, confirmed that no data left customer-db,
because the attacker's session was cut off by the firewall team within 40 minutes.

The response was led by Priya Nair and coordinated by Helen Park, the head of security. The team
patched web-01 and app-02, rotated the svc-backup credentials, and added a rule that blocks
app-02 from reaching customer-db except on the billing port. Helen Park reported the incident to
the company's chief technology officer, Tomás Ortega, on 15 March.
