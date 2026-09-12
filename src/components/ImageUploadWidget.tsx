import React from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { MaterialIcons } from '@expo/vector-icons'

type ImageUploadWidgetProps = {
  title: string
  label?: string
  /** The confirmed/uploaded image URI (e.g. remote URL or persisted local URI). */
  uri: string | null
  errorMessage?: string
  /** Called when user crops an image (local URI) or removes it (null). */
  onSelect: (uri: string | null) => void
  aspectRatio?: [number, number]
  disabled?: boolean

  // ─── Two-Phase Upload Props (optional — backward compatible) ──────────────
  /**
   * If provided, enables two-phase flow:
   *   1. User crops → preview shown with Upload button
   *   2. User taps Upload → onUpload(localUri) called
   *   3. On success, parent sets `uri` to the remote URL
   *
   * If NOT provided, the widget behaves exactly as before (one-step).
   */
  onUpload?: (localUri: string) => Promise<void>
  /** External loading state: when true, shows "Uploading..." and disables actions. */
  isUploading?: boolean
  /** Upload-specific error message. Shown with a "Retry Upload" button. */
  uploadError?: string
}

export default function ImageUploadWidget({
  title,
  label = 'No file selected',
  uri,
  errorMessage,
  onSelect,
  aspectRatio,
  disabled = false,
  onUpload,
  isUploading = false,
  uploadError,
}: ImageUploadWidgetProps) {
  // Internal state for the cropped-but-not-yet-uploaded image (two-phase only)
  const [pendingUri, setPendingUri] = React.useState<string | null>(null)

  const isTwoPhase = typeof onUpload === 'function'

  // When a confirmed URI arrives from the parent (e.g., successful upload), clear any pending state
  React.useEffect(() => {
    setPendingUri(null)
  }, [uri])

  const pickImage = async () => {
    if (disabled || isUploading) return
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload images.')
      return
    }

    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    }

    if (aspectRatio) {
      options.aspect = aspectRatio
    }

    const result = await ImagePicker.launchImageLibraryAsync(options)

    if (!result.canceled && result.assets?.[0]) {
      const croppedUri = result.assets[0].uri

      if (isTwoPhase) {
        // Two-phase: store as pending, don't call onSelect yet
        setPendingUri(croppedUri)
      } else {
        // Legacy one-step: pass through immediately
        onSelect(croppedUri)
      }
    }
  }

  const handleUpload = async () => {
    if (!pendingUri || !onUpload || isUploading) return
    await onUpload(pendingUri)
    // Parent is responsible for setting `uri` on success and clearing `uploadError`.
    // pendingUri is cleared by the useEffect above when `uri` changes.
  }

  const handleCancelPending = () => {
    setPendingUri(null)
  }

  const handleRemove = () => {
    setPendingUri(null)
    onSelect(null)
  }

  // ─── STATE 2: Pending Upload (two-phase only) ──────────────────────────────
  if (isTwoPhase && pendingUri) {
    return (
      <View style={[styles.container, styles.containerPending]}>
        <View style={styles.uploadedHeader}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.pendingLabel}>Image cropped — tap Upload to save</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image source={{ uri: pendingUri }} style={styles.image} contentFit="cover" />
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </View>

        {uploadError ? (
          <View style={styles.uploadErrorBanner}>
            <MaterialIcons name="error-outline" size={16} color="#D32F2F" />
            <Text style={styles.uploadErrorText}>{uploadError}</Text>
          </View>
        ) : null}

        <View style={styles.pendingActions}>
          <Pressable
            style={[
              styles.uploadButton,
              isUploading && styles.uploadButtonDisabled,
            ]}
            onPress={() => void handleUpload()}
            disabled={isUploading || disabled}
          >
            {isUploading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.uploadButtonText}>Uploading...</Text>
              </>
            ) : uploadError ? (
              <>
                <MaterialIcons name="refresh" size={18} color="#fff" />
                <Text style={styles.uploadButtonText}>Retry Upload</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="cloud-upload" size={18} color="#fff" />
                <Text style={styles.uploadButtonText}>Upload</Text>
              </>
            )}
          </Pressable>

          {!isUploading && (
            <Pressable
              style={styles.cancelButton}
              onPress={handleCancelPending}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          )}
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    )
  }

  // ─── STATE 3: Uploaded / Confirmed (image present) ─────────────────────────
  if (uri) {
    return (
      <View style={[styles.container, styles.containerUploaded]}>
        <View style={styles.uploadedHeader}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image source={{ uri }} style={styles.image} contentFit="cover" />
          <View style={styles.overlayActions}>
            <Pressable 
              style={[styles.actionButton, styles.replaceButton]} 
              onPress={pickImage}
              disabled={disabled || isUploading}
            >
              <MaterialIcons name="edit" size={16} color="#8B5A00" />
              <Text style={styles.replaceButtonText}>Replace</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, styles.removeButton]} 
              onPress={handleRemove}
              disabled={disabled || isUploading}
            >
              <MaterialIcons name="delete-outline" size={16} color="#D32F2F" />
              <Text style={styles.removeButtonText}>Remove</Text>
            </Pressable>
          </View>
        </View>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    )
  }

  // ─── STATE 1: Empty (no image) ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <Pressable
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={pickImage}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>Upload</Text>
        </Pressable>
      </View>
      
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      
      <Pressable 
        style={[styles.placeholder, disabled && styles.placeholderDisabled]} 
        onPress={pickImage}
        disabled={disabled}
      >
        <MaterialIcons name="add-photo-alternate" size={32} color={disabled ? "#BDBDBD" : "#8B5A00"} />
        <Text style={[styles.placeholderText, disabled && styles.placeholderTextDisabled]}>Tap to choose image</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E7DD',
    marginBottom: 16,
  },
  containerUploaded: {
    backgroundColor: '#FAF6F0',
    borderColor: '#E8D5BE',
  },
  containerPending: {
    backgroundColor: '#FFF8F0',
    borderColor: '#F0C890',
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadedHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#2B231B',
    marginBottom: 2,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#7E7162',
  },
  pendingLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#E65C00',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#FFF0D9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  buttonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#E65C00',
  },
  error: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#D32F2F',
    marginTop: 8,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5EDE4',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8D5BE',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayActions: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  replaceButton: {
    backgroundColor: '#FFF0D9',
  },
  removeButton: {
    backgroundColor: '#FFF1F1',
  },
  replaceButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#8B5A00',
  },
  removeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#D32F2F',
  },
  placeholder: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: '#E0D4C3',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF6F0',
  },
  placeholderDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  placeholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#8B5A00',
    marginTop: 8,
  },
  placeholderTextDisabled: {
    color: '#9E9E9E',
  },

  // ─── Two-Phase Upload States ─────────────────────────────────────────────
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadingText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    fontWeight: '700',
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E65C00',
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 48,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#9E9080',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8F8',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 8,
  },
  uploadErrorText: {
    flex: 1,
    color: '#D32F2F',
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
})
