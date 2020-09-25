const request = require('request');

const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((err, ip) => {
    if (err) return console.log('Fail to fetch IP ' + err);
    fetchCoordsByIP(ip, (err, location) => {
      if (err) return console.log('Fail to fetch coordinates ' + err);
      fetchISSFlyoverTimes(location, (err, passTime) => {
        if (err) return console.log('Fail to fetch pass time ' + err);
        callback(null,passTime);
      });
    });
  });
};
/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function (callback) {
  // use request to fetch IP address from JSON API
  request('https://api.ipify.org?format=json', (err, res, body) => {
    if (err) return callback(err, null);
    if (res.statusCode !== 200) {
      const msg = `Status code ${res.statusCode} when fetching IP ${body}`;
      callback(Error(msg), null);
    }
    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};

const fetchCoordsByIP = function (ip, callback) {
  request(`https://ipvigilante.com/${ip}`, (err, res, body) => {
    if (err) return callback(err, null);
    if (res.statusCode !== 200) {
      const msg = `Status code ${res.statusCode} when fetching IP ${ip}`;
      callback(Error(msg), null);
      return;
    }
    const location = {
      latitude: JSON.parse(body).data.latitude,
      longitude: JSON.parse(body).data.longitude,
    };
    callback(null, location);
  });
};

const fetchISSFlyoverTimes = function (coord, callback) {
  request(
    `http://api.open-notify.org/iss-pass.json?lat=${coord.latitude}&lon=${coord.longitude}`,
    (err, res, body) => {
      if (err) return callback(err, null);
      if (res.statusCode !== 200) {
        const msg = `Status code ${res.statusCode} when fetch `;
        callback(Error(msg), null);
      }
      const passTime = JSON.parse(body).response;
      callback(null, passTime);
    }
  );
};

module.exports = {
  nextISSTimesForMyLocation,
  fetchMyIP,
  fetchCoordsByIP,
  fetchISSFlyoverTimes,
};
