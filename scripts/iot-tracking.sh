[Unit]
Description=IoT-Tracking
After=network-online.target
 
[Service]
Type=simple
User=root
UMask=007
ExecStart=@path@ @args@
Restart=on-failure
TimeoutStopSec=300
 
[Install]
WantedBy=multi-user.target

