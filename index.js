// Corrected version fixing syntax errors and using denylist for multiple domains

let Service, Characteristic;
const { exec } = require('child_process');

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory(
    'homebridge-nextdns-youtube-block',
    'NextDNSYouTubeBlock',
    NextDNSYouTubeBlockAccessory
  );
};

class NextDNSYouTubeBlockAccessory {
  constructor(log, config) {
    this.log = log;
    this.config = config;
    this.profileID = config.profileID;
    this.apiKey = config.apiKey;
    this.domains = ["youtube.com", "googlevideo.com"];

    this.service = new Service.Switch(config.name);

    this.service
      .getCharacteristic(Characteristic.On)
      .on('get', this.handleGet.bind(this))
      .on('set', this.handleSet.bind(this));
  }

  handleGet(callback) {
    const url = `https://api.nextdns.io/profiles/${this.profileID}/denylist`;

    exec(`curl -s -X GET "${url}" -H "X-Api-Key: ${this.apiKey}"`, (error, stdout) => {
      if (error) {
        this.log('Error fetching state:', error);
        return callback(null, false);
      }

      let response;
      try {
        response = JSON.parse(stdout);
        const blocked = this.domains.every(domain => response.data.includes(domain));
        this.log('Domains Block status:', blocked);
        callback(null, blocked);
      } catch (parseError) {
        this.log('JSON parse error:', parseError, 'Response:', stdout);
        callback(null, false);
      }
    });
  }

  handleSet(value, callback) {
    const url = `https://api.nextdns.io/profiles/${this.profileID}/denylist`;

    if (value) {
      const payload = JSON.stringify(this.domains.map(domain => ({ id: domain, active: true })));

      exec(`curl -s -X PUT '${url}' -H 'X-Api-Key: ${this.apiKey}' -H 'Content-Type: application/json' -d '${payload}'`, (error) => {
        if (error) {
          this.log('Error adding domains to denylist:', error);
          this.service.getCharacteristic(Characteristic.On).updateValue(false);
        } else {
          this.log('Added domains to denylist');
          this.service.getCharacteristic(Characteristic.On).updateValue(true);
        }
      });
      callback();
    } else {
      const deletePromises = this.domains.map(domain => new Promise((resolve) => {
        exec(`curl -s -X DELETE '${url}/${domain}' -H 'X-Api-Key: ${this.apiKey}'`, (error) => {
          if (error) {
            this.log('Error removing from denylist:', domain, error);
          }
          resolve();
        });
      }));

      Promise.all(deletePromises)
        .then(() => {
          this.log('Removed domains from denylist:', this.domains);
          this.service.getCharacteristic(Characteristic.On).updateValue(false);
        })
        .catch((error) => {
          this.log('Error during removal:', error);
          this.service.getCharacteristic(Characteristic.On).updateValue(true);
        });

    callback();
    }
  }

  getServices() {
    return [this.service];
  }
}
