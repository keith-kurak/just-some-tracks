import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AudioRecorder from "./AudioRecorder";
import AudioPlayer from "./AudioPlayer";

const AudioTracksScreen = () => {
  const [tracks, setTracks] = useState([]);
  const [showRecorder, setShowRecorder] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const handleSaveTrack = (uri, duration) => {
    const newTrack = {
      id: Date.now().toString(),
      uri,
      duration,
      name: `Track ${tracks.length + 1}`,
      date: new Date().toISOString(),
    };

    setTracks([...tracks, newTrack]);
    setShowRecorder(false);
  };

  const handleDeleteTrack = (id) => {
    setTracks(tracks.filter((track) => track.id !== id));

    // If the deleted track is currently selected, clear selection
    if (selectedTrack && selectedTrack.id === id) {
      setSelectedTrack(null);
    }
  };

  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const renderTrackItem = ({ item }) => {
    const isSelected = selectedTrack && selectedTrack.id === item.id;

    return (
      <Pressable
        style={[styles.trackItem, isSelected && styles.selectedTrack]}
        onPress={() => handleTrackSelect(item)}
      >
        <View style={styles.trackInfo}>
          <Text style={styles.trackName}>{item.name}</Text>
          <Text style={styles.trackDetails}>
            {formatTime(item.duration)} • {formatDate(item.date)}
          </Text>
        </View>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeleteTrack(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#E74C3C" />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Tracks</Text>

      {tracks.length > 0 ? (
        <FlatList
          data={tracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          style={styles.tracksList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No tracks yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first audio track by tapping the button below
          </Text>
        </View>
      )}

      {selectedTrack && (
        <View style={styles.playerContainer}>
          <AudioPlayer
            track={selectedTrack}
            onClose={() => setSelectedTrack(null)}
          />
        </View>
      )}

      {showRecorder ? (
        <View style={styles.recorderContainer}>
          <AudioRecorder onSave={handleSaveTrack} />
          <Pressable
            style={styles.cancelButton}
            onPress={() => setShowRecorder(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[
            styles.addButton,
            selectedTrack && styles.addButtonWithPlayer,
          ]}
          onPress={() => setShowRecorder(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Record New Track</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  tracksList: {
    flex: 1,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedTrack: {
    backgroundColor: "#E8F4FD",
    borderColor: "#3498DB",
    borderWidth: 1,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trackDetails: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    color: "#666",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498DB",
    borderRadius: 8,
    padding: 15,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButtonWithPlayer: {
    bottom: 100, // Move button up when player is visible
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  recorderContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  playerContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  cancelButton: {
    alignItems: "center",
    padding: 15,
    marginTop: 10,
  },
  cancelText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AudioTracksScreen;
