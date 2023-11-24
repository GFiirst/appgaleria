import { Image, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import ProgressBar from "./ProgressBar";


export function UploadingAndroid({ image, progress }) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        },
      ]}
    >
      {Platform.OS === "ios" && (
        <VibrancyView
          
          style={StyleSheet.absoluteFill}
        ></VibrancyView>
      )}

        <View
          style={{
            alignItems: "center",
            paddingVertical: 10,
            rowGap: 12,
            borderRadius: 14,
            backgroundColor: "#FFFFFF",
          }}
        >
          {image && (
            <Image
              source={{ uri: image }}
              style={{
                width: 100,
                height: 100,
                resizeMode: "contain",
                borderRadius: 6,
              }}
            />
          )}
          
          
          <Text style={{ fontSize: 12 }}>Carregando...</Text>
          <ProgressBar progress={progress} />
          <View
            style={{
              height: 1,
              borderWidth: StyleSheet.hairlineWidth,
              width: "100%",
              borderColor: "#00000020",
            }}
          />
          <TouchableOpacity>
            <Text style={{ fontWeight: "500", color: "#3478F6", fontSize: 17 }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      
    </View>
  );
}