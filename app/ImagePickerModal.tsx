import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Image,
  Platform,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ImagePickerModal() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const closePicker = () => {
    router.back();
  };

  const retakePicture = () => {
    setSelectedImage(null);
  };

  const confirmPicture = () => {
    if (!selectedImage) return;
    
    router.replace({
      pathname: '/(tabs)/plant_info',
      params: { 
        photoUri: selectedImage
      }
    });
  };

  // Image preview screen
  if (selectedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        <SafeAreaView style={styles.previewControls}>
          <View style={styles.previewHeader}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={closePicker}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.previewFooter}>
            <TouchableOpacity 
              style={styles.previewButton} 
              onPress={retakePicture}
            >
              <Ionicons name="refresh" size={28} color="white" />
              <Text style={styles.previewButtonText}>Choose Another</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.previewButton} 
              onPress={confirmPicture}
            >
              <Ionicons name="checkmark-circle" size={28} color="white" />
              <Text style={styles.previewButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Image picker screen
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SafeAreaView style={styles.header}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={closePicker}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.centerContent}>
          <TouchableOpacity 
            style={styles.pickButton} 
            onPress={pickImage}
          >
            <Ionicons name="images" size={48} color="white" />
            <Text style={styles.pickButtonText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  pickButtonText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'contain'
  },
  previewControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  previewHeader: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 15,
  },
  previewButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  previewButtonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 16,
  }
}); 