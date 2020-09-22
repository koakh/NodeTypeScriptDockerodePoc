const { readFileSync } = require('fs');
import Docker, { ContainerInfo } from 'dockerode';

const certs = {
  c3: {
    host: 'c3edu.online',
    port: 2376,
    ca: 'certs/c3/ca.pem',
    cert: 'certs/c3/server-cert.pem',
    key: 'certs/c3/server-key.pem',
  },
  staging: {
    host: 'staging.c3cloudcontrol.com',
    port: 2376,
    ca: 'certs/staging.c3cloudcontrol.com/ca.pem',
    cert: 'certs/staging.c3cloudcontrol.com/server-cert.pem',
    key: 'certs/staging.c3cloudcontrol.com/server-key.pem',
  }
};

// test staging with
// HOST=staging.c3cloudcontrol.com
// CERTS="--cacert certs/staging.c3cloudcontrol.com/ca.pem --cert certs/staging.c3cloudcontrol.com/server-cert.pem --key certs/staging.c3cloudcontrol.com/server-key.pem"
// curl https://${HOST}:2376/images/json ${CERTS} | jq
// 
// HOST=c3edu.online
// CERTS="--cacert certs/c3/ca.pem --cert certs/c3/server-cert.pem --key certs/c3/server-key.pem"
// curl https://${HOST}:2376/images/json ${CERTS} | jq
// curl: (35) error:0407006A:rsa routines:RSA_padding_check_PKCS1_type_1:block type is not 01

// use sock
// const dockerUnixSock = new Docker({ socketPath: '/var/run/docker.sock' });

// use tcp
const hostCerts = 'c3';
// const hostCerts = 'staging';
const dockerTCP = new Docker({
  protocol: 'https',
  host: certs[hostCerts].host,
  port: certs[hostCerts].port,
  ca: readFileSync(certs[hostCerts].ca),
  cert: readFileSync(certs[hostCerts].cert),
  key: readFileSync(certs[hostCerts].key)
});

const init = async () => {
  debugger;
  // filter container ids
  const optionsAll = { all: true };
  // const optionsContainerId = { filters: { id: ['6b5256c25429c7f9d68a38d9a847f684f0c37eeb2e0a0d7dc92ded2686c30e90'] } };
  const containers: ContainerInfo[] = await dockerTCP.listContainers(optionsAll);
  // console.log('containers', containers);
  containers.forEach((c: ContainerInfo) => {
    console.log(`id: ${c.Id}, names: ${c.Names}, state: ${c.State}, status: ${c.Status}`);
  });
}

init();