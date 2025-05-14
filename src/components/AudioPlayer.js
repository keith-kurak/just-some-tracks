import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Audio } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

const AudioPlayer = ({ track, onClose }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [track]);

  const loadSound = async () => {
    if (sound) {
      await sound.unloadAsync();
    }

    setIsLoading(true);

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: Audio.InterruptionMode.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.InterruptionMode.DoNotMix,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { progressUpdateIntervalMillis: 100 },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading sound", error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);

      if (!isSeeking) {
        setPosition(status.positionMillis);
      }

      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekComplete = async (value) => {
    if (!sound) return;

    setIsSeeking(false);
    setPosition(value);

    await sound.setPositionAsync(value);

    if (isPlaying) {
      await sound.playAsync();
    }
  };

  const formatTime = (millis) => {
    if (!millis) return "0:00";

    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {track.name || "Unknown Track"}
        </Text>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#666" />
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={styles.playButton}
          onPress={togglePlayPause}
          disabled={isLoading}
        >
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={64}
            color={isLoading ? "#CCC" : "#3498DB"}
          />
        </Pressable>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingStart={handleSeekStart}
          onSlidingComplete={handleSeekComplete}
          minimumTrackTintColor="#3498DB"
          maximumTrackTintColor="#DDD"
          thumbTintColor="#3498DB"
          disabled={isLoading}
        />
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  controls: {
    alignItems: "center",
    marginVertical: 16,
  },
  playButton: {
    padding: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  time: {
    fontSize: 14,
    color: "#666",
    width: 40,
    textAlign: "center",
  },
});

export default AudioPlayer;
