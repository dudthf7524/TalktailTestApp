import React from "react";
import {SafeAreaView, StyleSheet, Text, View, Image} from "react-native";

interface Pet {
  name: string;
  gender: boolean;
  birth: string;
  breed: string;
  isNeutered: boolean;
  disease: string;
}

interface DashboardInfoProps {
  screen: string;
  pet: Pet;
}

const DashboardInfo = ({screen, pet}: DashboardInfoProps) => {
  const containerStyle = {
    ...styles.container,
    ...(screen === 'LANDSCAPE' ? styles.container_landscape : styles.container_portrait)
  };

  return (
    <SafeAreaView style={containerStyle}>
      {screen === "PORTRAIT" && (
        <>
          <View style={styles.info_container}>
            <Text style={styles.info_name}>{pet.name}</Text>
            <View style={styles.info_box}>
              <Image 
                source={
                  pet.gender 
                    ? require("../assets/images/gender_male.jpg")
                    : require("../assets/images/gender_female.jpg")
                } 
                style={styles.icon_gender}
              />
              <Text style={styles.info_age}>{pet.breed}</Text>
            </View>
          </View>
          <View style={styles.diseases_container}>
            <Text style={styles.info_diseases}>병명 : {pet.disease}</Text>
          </View>
        </>
      )}
      {screen === "LANDSCAPE" && (
        <>
          <View style={styles.landscape_container}>
            <Text style={[styles.info_name, styles.info_name_land]}>{pet.name}</Text>
            <View style={styles.info_box}>
              <Image 
                source={
                  pet.gender
                    ? require("../assets/images/gender_male.jpg")
                    : require("../assets/images/gender_female.jpg")
                } 
                style={[styles.icon_gender, styles.icon_gender_land]}
              />
              <Text style={[styles.info_age, styles.info_age_land]}>{pet.breed}</Text>
            </View>
            <Text style={[styles.info_diseases, styles.info_diseases_land]}> 병명 : {pet.disease}</Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#ffffff",
  },
  container_portrait: {
    paddingVertical: 10,
  },
  container_landscape: {
    paddingVertical: 0,
  },
  info_container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop:10
  },
  landscape_container : {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  info_name: {
    fontSize: 20,
    fontWeight: '400',
    color: '#262626',
  },
  info_name_land: {
    fontSize:12,
  },
  info_box: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon_gender: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  icon_gender_land: {
    width: 12,
    height: 12,
  },
  info_age: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7b7b7b',
  },
  info_age_land: {
    fontSize: 12,
  },
  diseases_container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  info_diseases: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7b7b7b',
  },
  info_diseases_land: {
    fontSize: 12,
  },
});

export default DashboardInfo;