/**
 * TheFlasherR
 * https://github.com/facebook/react-native
 * https://github.com/tnguyen137/TheFlasherR
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, PermissionAndroid, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MapView, {Marker, AnimatedRegion, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import haversine from 'haversine';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA= 0.009;

class AnimatedMarkers extends React.Component {
  constructor(props) {
    super (props);
    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      routeCoordinates: [],
      distranceTravelled: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: 0,
        longitudeDelta: 0
      })
    };
  }

  componentDidMount() {
    const { coordinate } = this.state;
    this.requestCameraPermission();
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const { routeCoordinates, distranceTravelled } = this.state;
        const { latitude, longitude } = position.coords;
        const newCoordinate = {
          latitude,
          longitude
        };
        console.log({ newCoordinate });

        if(Platform.OS === "android") {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(
              newCoordinate, 500
            );
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }

        this.setState({
          latitude,
          longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distranceTravelled:
            distranceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate
        });
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10
      }
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: this.state.latitudeDelta,
    longitudeDelta: this.state.longitudeDelta
  });

  calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  requestCameraPermission = async () => {
    try {
      const granted = await PermissionAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Location Access Permission",
          buttonNeutral: "Ask Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULT.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera Permission Denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  render() {
    return (
      <View style = {styles.container}>
        <MapView
          style={ styles.map }
          provider={ PROVIDER_GOOGLE }
          showUserLocation
          loadingEnabled
          region={ this.getMapRegion() }
        >
        <Polyline coorindates = {this.state.routeCoordinates} strokeWidth={5}/>
        <Marker.Animated
          ref= {marker => {
            this.marker = marker;
          }}
          coordinate = {this.state.coordinate}
        />
        </MapView>
        <View style = {styles.buttonContainer}>
          <TouchableOpacity style = {[styles.bubble, styles.button]}>
            <Text style = {styles.bottomBarContent}>
              {parseFloat(this.state.distranceTravelled).toFixed(2)} km
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
/*
type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native! TK</Text>
        <Text style={styles.instructions}>To get started, edit App.js TK</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}*/

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width:80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default AnimatedMarkers;
