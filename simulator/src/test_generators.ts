import {
  generateLocation,
  generateEmergencyCall,
  generateCitizenApp,
  generateIotSensor,
  generateUnitTelemetry,
} from './generators';

function run() {
  console.log('Testing Generators...\n');
  const loc = generateLocation();
  
  console.log('Emergency Call:');
  console.log(JSON.stringify(generateEmergencyCall(loc), null, 2));
  
  console.log('\nCitizen App:');
  console.log(JSON.stringify(generateCitizenApp(loc), null, 2));
  
  console.log('\nIoT Sensor:');
  console.log(JSON.stringify(generateIotSensor(loc), null, 2));
  
  console.log('\nUnit Telemetry:');
  console.log(JSON.stringify(generateUnitTelemetry(loc), null, 2));
}

run();
