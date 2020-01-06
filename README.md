# homebridge-ai-sync-platform
Enables AI Synch Fans and their lights in Homebridge for homekit

To install:

    npm install -g homebridge-ai-sync-platform

To configure, add this to your homebridge config.json file:
    
    
    "platforms": [
        {
            "platform": "AISync",
            "name": "AISync Platform",
            "email": "your_email@email.com",
            "password": "your_password"
        }
    ]


## Supports:
* Fans
* Lights within the fan
