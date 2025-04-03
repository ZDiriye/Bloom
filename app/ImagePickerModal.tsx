import { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  StatusBar, 
  Platform, 
  SafeAreaView,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ImagePickerModal() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  }

  function closePicker() {
    router.back();
  }

  function retakePicture() {
    setSelectedImage(null);
  }

  async function confirmPicture() {
    if (!selectedImage) return;
    
    // Navigate to plant info screen with the selected image
    router.replace({
      pathname: '/(tabs)/plant_info',
      params: { 
        photoUri: selectedImage
      }
    });
  }

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
          <Ionicons name="images" size={120} color="#4c956c" style={styles.icon} />
          <Text style={styles.title}>Choose a Photo</Text>
          <Text style={styles.subtitle}>Select an image from your library to identify the plant</Text>
        </View>

        <SafeAreaView style={styles.bottomControls}>
          <TouchableOpacity 
            style={styles.pickButton} 
            onPress={pickImage}
          >
            <Ionicons name="folder-open" size={24} color="white" />
            <Text style={styles.pickButtonText}>Open Library</Text>
          </TouchableOpacity>
        </SafeAreaView>
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
    justifyContent: 'space-between',
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
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  pickButton: {
    backgroundColor: '#4c956c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  pickButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
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