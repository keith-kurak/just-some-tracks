import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Audio } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";

const AudioRecorder = ({ onSave }) => {
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    return () => {
      // Clean up resources when component unmounts
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (player) {
        player.unloadAsync();
      }
    };
  }, [recording, player]);

  const startRecording = async () => {
    try {
      // Request recording permissions if not granted
      if (!permissionResponse?.granted) {
        await requestPermission();
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: Audio.InterruptionMode.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.InterruptionMode.DoNotMix,
      });

      // Create a new recording instance
      const { recording: recordingObject } = await Audio.Recording.createAsync(
        Audio.RecordingPresets.HIGH_QUALITY,
        (status) => {
          setDuration(status.durationMillis);
        },
        200 // Update status every 200ms
      );

      setRecording(recordingObject);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setAudioUri(uri);
      setIsRecording(false);

      // If onSave callback is provided, call it with the audio URI
      if (onSave) {
        onSave(uri, duration);
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  const playRecording = async () => {
    if (!audioUri) return;

    try {
      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: Audio.InterruptionMode.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.InterruptionMode.DoNotMix,
      });

      // If there's an existing player, unload it
      if (player) {
        await player.unloadAsync();
      }

      // Create and load a new audio player
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, progressUpdateIntervalMillis: 50 },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        }
      );

      setPlayer(sound);
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to play recording", error);
    }
  };

  const stopPlaying = async () => {
    if (!player) return;

    try {
      await player.stopAsync();
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to stop playback", error);
    }
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.container}>
      {isRecording ? (
        <View style={styles.recordingContainer}>
          <Text style={styles.recordingText}>
            Recording... {formatTime(duration)}
          </Text>
          <Pressable style={styles.recordButton} onPress={stopRecording}>
            <Ionicons name="stop-circle" size={64} color="#E74C3C" />
          </Pressable>
        </View>
      ) : audioUri ? (
        <View style={styles.playbackContainer}>
          <Text style={styles.playbackText}>
            {isPlaying ? formatTime(position) : formatTime(duration)}
          </Text>
          <Pressable
            style={styles.playButton}
            onPress={isPlaying ? stopPlaying : playRecording}
          >
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={64}
              color="#3498DB"
            />
          </Pressable>
          <Pressable
            style={styles.newRecordingButton}
            onPress={() => {
              setAudioUri(null);
              setDuration(0);
              setPosition(0);
            }}
          >
            <Text style={styles.newRecordingText}>New Recording</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.recordButton} onPress={startRecording}>
          <Ionicons name="mic-circle" size={64} color="#E74C3C" />
          <Text style={styles.buttonText}>Start Recording</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  recordButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  buttonText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  recordingContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  recordingText: {
    fontSize: 18,
    marginBottom: 15,
    color: "#E74C3C",
  },
  playbackContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  playbackText: {
    fontSize: 18,
    marginBottom: 15,
    color: "#3498DB",
  },
  playButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  newRecordingButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#2ECC71",
    borderRadius: 5,
  },
  newRecordingText: {
    color: "white",
    fontSize: 16,
  },
});

export default AudioRecorder;
