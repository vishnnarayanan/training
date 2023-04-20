const jose = require('node-jose');
const fetch = require('node-fetch');

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
  credStore: { label: 'credstore' },
});
const binding = services.credStore;

function checkStatus(response) {
  if (!response.ok) {
    throw Error('checkStatus: ' + response.status + ' ' + response.statusText);
  }
  return response;
}

async function decryptPayload(privateKey, payload) {
  const key = await jose.JWK.asKey(
    `-----BEGIN PRIVATE KEY-----${privateKey}-----END PRIVATE KEY-----`,
    'pem',
    { alg: 'RSA-OAEP-256', enc: 'A256GCM' },
  );
  const decrypt = await jose.JWE.createDecrypt(key).decrypt(payload);
  const result = decrypt.plaintext.toString();
  return result;
}

function headers(binding, namespace, init) {
  const result = new fetch.Headers(init);
  result.set(
    'Authorization',
    `Basic ${Buffer.from(`${binding.username}:${binding.password}`).toString(
      'base64',
    )}`,
  );
  result.set('sapcp-credstore-namespace', namespace);
  return result;
}

async function fetchAndDecrypt(privateKey, url, method, headers, body) {
  const result = await fetch(url, { method, headers, body })
    .then(checkStatus)
    .then((response) => response.text())
    .then((payload) => decryptPayload(privateKey, payload))
    .then(JSON.parse);
  return result;
}

async function fetchAndDecryptValue(privateKey, url, method, headers, body) {
  const result = await fetch(url, { method, headers, body })
    .then(checkStatus)
    .then((response) => response.text())
    .then((payload) => decryptPayload(privateKey, payload))
    .then(JSON.parse);
  return result.value;
}

export async function readCredential(namespace, type, name) {
  return fetchAndDecrypt(
    binding.encryption.client_private_key,
    `${binding.url}/${type}?name=${encodeURIComponent(name)}`,
    'get',
    headers(binding, namespace, {}),
    {},
  );
}

export async function readCredentialValue(namespace, type, name) {
  return fetchAndDecryptValue(
    binding.encryption.client_private_key,
    `${binding.url}/${type}?name=${encodeURIComponent(name)}`,
    'get',
    headers(binding, namespace, {}),
    {},
  );
}

// async function decryptPayload(privateKey, payload) {
//   const key = await jose.JWK.asKey(
//     `-----BEGIN PRIVATE KEY-----${privateKey}-----END PRIVATE KEY-----`,
//     'pem',
//     { alg: 'RSA-OAEP-256', enc: 'A256GCM' },
//   );
//   const decrypt = await jose.JWE.createDecrypt(key).decrypt(payload);
//   const result = decrypt.plaintext.toString();
//   return result;
// }

// async function fetchAndDecrypt(privateKey, url, method, headers, body) {
//   const result = await fetch(url, { method, headers, body })
//     // .then(checkStatus)
//     .then((response) => response.text())
//     .then((payload) => decryptPayload(privateKey, payload))
//     .then(JSON.parse)
//     .catch((error) => {
//       console.log(error);
//     });
//   return result;
// }

// export async function fetchKey() {
//   const credential ={
//     name: 'wdcredstore',
//     value: 'SAP_URL',
//     username:
//       'de59bcd6-ae60-499a-857f-3df12df6fa47.0.iCG+huIMVr7P8xX5MNE9wfkucsykIRtVCXNuwvPNUP0=',
//   };
//   const privateKey =
//     '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';
//   const credURL =
//     'https://credstore.mesh.cf.us10.hana.ondemand.com/api/v1/credentials';
//   fetchAndDecrypt(
//     privateKey,
//     credURL,
//     'post',
//     {
//       'Content-Type': 'application/jose',
//     },

//     await encryptPayload(
//       'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAr1xeTxgWufo6NmPuE3cCTJx/3UwL8OzaRSD/gpBA0QHbbsH6W8ryhQK9IR4i2hHNtIByJVDGBNrrkN+pcUfSEbMBBUpNFiT6tJ9dh4gGFQOuEg4vUu9flDtODEKMETyIQnql1nSVvPeocfzPaTQzz5la8TSfgPbXqNQMX4oDobvXyXxnFIKORf3LQyPT6XHbN+kUnLmYqBD/n0loGp8K72cRiNQ49Tp3VO0X15wsMwD8OsBj5kddtGw/YUz4Kt6nrjK5SoxfId/qdmR8s7AFc5h8le7dYtpHkEdmY/+xmStmqOIM5t+k3k1+Xx7BqDVDejH/CJwF9aig+Gp+4+nqbkVfysGnWtVJHvuQLVFLXoPtmcTvxFFGwbckf2Nb9bshUCHecWTwfyM1l8uw4L7nYTYEZbu471poLbJTw64KdXKK2i6JjEI1t2dA3F1n67JYjFNeQ+0DOQDbh871UwqbueJ8gysT9Uj3vcdsrKybkcacV9LnL82vhwqCvxwwCkzlAgMBAAE=',
//       JSON.stringify(credential),
//     ),
//   );
// }

// async function encryptPayload(publicKey, payload) {
//   const key = await jose.JWK.asKey(
//     `-----BEGIN PUBLIC KEY-----${publicKey}-----END PUBLIC KEY-----`,
//     'pem',
//     { alg: 'RSA-OAEP-256' },
//   );
//   const options = {
//     contentAlg: 'A256GCM',
//     compact: true,
//     fields: { iat: Math.round(new Date().getTime() / 1000) },
//   };
//   const result = await jose.JWE.createEncrypt(options, key)
//     .update(Buffer.from(payload, 'utf8'))
//     .final();
//   return result;
// }
