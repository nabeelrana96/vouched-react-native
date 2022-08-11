import React, { useState, useRef } from 'react';
import { Button } from 'react-native';
import { StyleSheet, View, Text } from 'react-native';
import { VouchedFaceCamera } from '@vouched.id/vouched-react-native';
import { getSession } from '../common/session'
import { faceInstructionToLabel } from '../common/labels'

import { AUTH_BASE_COLOR } from 'common/colors';

const AuthScreen = ({ navigation, route }) => {
  const { jobId, matchId } = route.params;
  const cameraRef = useRef(null);
  const [message, setMessage] = useState('loading...');
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [session] = useState(getSession())

  return (
    <View style={styles.container}>
      <View style={styles.camera}>
        <VouchedFaceCamera 
          ref={cameraRef}
          livenessMode="BLINKING"
          onFaceStream={async (faceDetectionResult) => {
            const { instruction, step } = faceDetectionResult;

            if (step === "POSTABLE") {
              cameraRef.current.stop();
              setMessage("Processing");
              try {
                let authResult = await session.postReverify(faceDetectionResult, jobId);
                if (authResult.result.success == true) {
                  setMessage("Successfully reverified. Please continue to next step");  
                } else {
                  setMessage("Unable to Reverify. Please try again");
                  setShowTryAgain(true);
                }
              } catch (e) {
                setMessage("Unable to Reverify. Please check the job ID and try again");
                setShowTryAgain(true);
              }           
            } else {
              setMessage(faceInstructionToLabel(instruction, 'Show Face'))              
            }
          }}
        />
      </View>
      <View style={styles.footer}>
        <Text style={{ color: 'white' }} >{message}</Text>
      </View>
      {showTryAgain &&
        <View style={styles.tryAgain}>
          <Button title="Try Again" onPress={() => {
            cameraRef.current.restart();
            setShowTryAgain(false);
          }} />
        </View>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 7,
    flexDirection: 'column'
  },
  tryAgain: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: AUTH_BASE_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: AUTH_BASE_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column'
  }
});

export default AuthScreen;
