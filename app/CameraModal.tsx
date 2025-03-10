import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
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

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
    StatusBar.setBarStyle('light-content');
  
    return () => {
      StatusBar.setBarStyle('default');
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor('#000000');
      }
    };
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function closeCamera() {
    console.log('Camera closed');
    alert('Camera closed - In a real app, this would navigate back');
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo.uri);
      console.log(photo);
    }
  }

  function retakePicture() {
    setCapturedPhoto(null);
  }

  function confirmPicture() {
    console.log('Picture confirmed:', capturedPhoto);
    alert('Picture confirmed - In a real app, this would save or use the photo');
    setCapturedPhoto(null);
  }

  // Photo preview screen
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
        <SafeAreaView style={styles.previewControls}>
          <View style={styles.previewHeader}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={closeCamera}
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
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.previewButton} 
              onPress={confirmPicture}
            >
              <Ionicons name="checkmark-circle" size={28} color="white" />
              <Text style={styles.previewButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Camera screen
  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        facing={facing} 
        flash={flash} 
        ref={cameraRef}
      >
        <View style={styles.controlsContainer}>
          <SafeAreaView style={styles.header}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={closeCamera}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, flash === 'on' && styles.activeButton]} 
              onPress={() => setFlash(current => current === 'off' ? 'on' : 'off')}
            >
              <Ionicons 
                name={flash === 'on' ? "flash" : "flash-off"} 
                size={28} 
                color="white" 
              />
            </TouchableOpacity>
          </SafeAreaView>

          <SafeAreaView style={styles.bottomControls}>
            <View style={styles.bottomSpacer} />
            
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePicture}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </CameraView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    fontSize: 18,
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  activeButton: {
    backgroundColor: 'rgba(255,204,0,0.6)',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  bottomSpacer: {
    width: 56,
    height: 56,
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'white',
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
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
    paddingHorizontal: 0,
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
  },
});