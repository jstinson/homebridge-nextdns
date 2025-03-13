# homebridge-nextdns
Homebridge NextDNS Blocker

# Homebridge NextDNS YouTube Block

This plugin integrates NextDNS with Homebridge to easily block or unblock specific domains, like YouTube, using the denylist feature of NextDNS.

## Features
- Easily block or unblock specific domains (YouTube and related services) through Apple's HomeKit.
- Uses the NextDNS denylist API to manage domains.

## Installation

Navigate to your Homebridge plugins directory:

```bash
cd /var/lib/homebridge/
npm install homebridge-nextdns-youtube-block
```

## Configuration

Add this accessory to your Homebridge `config.json`:

```json
{
  "accessories": [
    {
      "accessory": "NextDNSYouTubeBlock",
      "name": "YouTube Block",
      "profileID": "your-nextdns-profile-id",
      "apiKey": "your-nextdns-api-key"
    }
  ]
```

Replace `your-nextdns-profile-id` and `your-nextdns-api-key` with your actual NextDNS profile ID and API key.

## Usage

Once installed and configured, a new switch accessory named "YouTube Block" will appear in your HomeKit app:

- Turning the switch **On** will add `youtube.com` and `googlevideo.com` to your NextDNS denylist.
- Turning the switch **Off** will remove these domains from your denylist.

## Testing via curl (optional)

- Add domains:

```bash
curl -X PUT "https://api.nextdns.io/profiles/{your-profile-id}/denylist" \
-H "X-Api-Key: {your-api-key}" \
-H "Content-Type: application/json" \
-d '[{"id":"youtube.com","active":true},{"id":"googlevideo.com","active":true}]'
```

- Remove a domain:

```bash
curl -X DELETE "https://api.nextdns.io/profiles/{your-profile-id}/denylist/youtube.com" \
-H "X-Api-Key: {your-api-key}"
```

Replace `{your-profile-id}` and `{your-api-key}` accordingly.

## Troubleshooting

Check the Homebridge logs if you encounter issues:

```bash
journalctl -u homebridge -f
```

## License

Apache 2.0

