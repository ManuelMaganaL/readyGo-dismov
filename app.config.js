module.exports = () => {
  // Verificamos si EAS nos mandó la bandera de desarrollo
  const isDev = process.env.APP_VARIANT === 'development';

  return {
    expo: {
      // Si es desarrollo, le agrega (Dev) al nombre en tu pantalla
      name: isDev ? "readyGO (Dev)" : "readyGO",
      slug: "ready-go",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "miapp",
      userInterfaceStyle: "automatic",
      plugins: [
        "@react-native-community/datetimepicker",
        "expo-notifications"
      ],
      ios: {
        icon: "./assets/images/icon-ios.png"
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#FFFFFF"
        },
        // Aquí está la clave: cambia el paquete interno para que no choque
        package: isDev ? "com.readygo.miapp.dev" : "com.readygo.miapp"
      },
      web: {
        favicon: "./assets/images/favicon.png"
      },
      extra: {
        eas: {
          projectId: "4d744ed8-0ec6-4574-afae-c98f67d81875"
        }
      }
    }
  };
};