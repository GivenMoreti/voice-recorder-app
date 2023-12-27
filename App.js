import * as React from "react";
import { Text, View, StyleSheet, Button, Pressable } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { EvilIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

export default function App() {
  const [recording, setRecording] = React.useState();
  const [recordedFileUri, setRecordedFileUri] = React.useState(null);
  const [isRecording, setIsRecording] = React.useState(false);

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      const { granted } = await Audio.requestPermissionsAsync();

      if (!granted) {
        console.log("Permission to record audio denied");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      setIsRecording(true);
      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recordingObject.startAsync();
      setRecording(recordingObject);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    try {
      console.log("Stopping recording..");
      if (!recording) {
        console.warn("No recording object found");
        return;
      }

      await recording.stopAndUnloadAsync();
      const status = await recording.getStatusAsync();

      if (status.canRecord) {
        console.error("Recording did not stop correctly");
        return;
      }

      setRecording(undefined);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecordedFileUri(uri);
      console.log("Recording stopped and stored at", uri);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }

  const playRecordedFile = async () => {
    if (recordedFileUri) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: recordedFileUri },
          { shouldPlay: true }
        );

        await sound.playAsync();
      } catch (error) {
        console.error("Error playing recorded file", error);
      }
    } else {
      console.warn("No recorded file to play");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>
          {isRecording ? "Recording 🦜" : "Record Parrot 🦜"}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.playBtn}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={styles.playText}>
            {recording ? (
              <Feather name="stop-circle" size={60} color="#fff" />
            ) : (
              <EvilIcons name="play" size={60} color="#fff" />
            )}{" "}
          </Text>
        </Pressable>

        <Pressable style={styles.playBtn} onPress={playRecordedFile}>
          <Text style={styles.playText}>
            <MaterialIcons name="playlist-play" size={60} color="#fff" />{" "}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 10,
  },
  playBtn: {
    backgroundColor: "orangered",
    height: 100,
    width: 100,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 50,
    margin: 10,
  },
  playText: {
    margin: 20,
  },
  heading: {
    padding: 20,
    fontSize: 30,
    color: "orangered",
    fontWeight: "900",
  },
  buttonContainer: {
    flex: 2,
  },
  headingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
