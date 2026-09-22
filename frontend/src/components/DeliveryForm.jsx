import { API_URL } from "../utils/api";
import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom'; 

const DeliveryForm = () => {
  const [district, setDistrict] = useState('');
  const [location, setLocation] = useState([]);
  const [farmerId, setFarmerId] = useState("");
  const [farmerPhone, setFarmerPhone] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [otherDistrict, setOtherDistrict] = useState('');
  const navigate = useNavigate();

  const handleDistrictChange = (e) => setDistrict(e.target.value);
  const handleFarmerIdChange = (e) => setFarmerId(e.target.value);
  const handleFarmerPhoneChange = (e) => setFarmerPhone(e.target.value);
  const handleWasteTypeChange = (e) => setWasteType(e.target.value);
  const handlePickupDateChange = (e) => setPickupDate(e.target.value);
  const handleEmergencyContact = (e) => setEmergencyContact(e.target.value);
  const handleOtherDistrictChange = (e) => setOtherDistrict(e.target.value);

  const handleMapClick = (e) => {
   
    setLocation([{ lat: e.latLng.lat(), long: e.latLng.lng() }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const deliveryData = {
      farmerId: parseInt(farmerId),
      farmerPhone,
      wasteType,
      pickupDate,
      district: district === 'Other' ? otherDistrict : district,
      location: {
        type: "Point",
        coordinates: [location[0].lat, location[0].long] // Longitude first, then Latitude
      },
      emergencyContact,
    };

    try {
      console.log(deliveryData)
      const response = await fetch(`${API_URL}/api/deliveryReq/delivery-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryData),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log('Response:', data);
      alert('Request submitted successfully!');
      navigate('/farmer-ReqForm');
    } catch (error) {
        console.log('Response:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial', margin: '20px auto', padding: '20px', maxWidth: '600px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', fontSize: '24px', marginBottom: '20px' }}>Delivery Request Form</h2>
      <form onSubmit={handleSubmit} style={{ padding: '20px' }}>

        <label style={{ fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block' }}>Farmer ID:</label>
        <input
          type="text"
          value={farmerId}
          onChange={handleFarmerIdChange}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
          required
        />
        <br /><br />

        <label style={{ fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block' }}>Farmer Phone:</label>
        <input
          type="tel"
          value={farmerPhone}
          onChange={handleFarmerPhoneChange}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
          required
        />
        <br /><br />

        <label style={{ fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block' }}>Waste Type:</label>
        <select
          value={wasteType}
          onChange={handleWasteTypeChange}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
          required
        >
          <option value="rice_husk">Rice Husk</option>
          <option value="coconut_shells">Coconut Shells</option>
          <option value="banana_stalks">Banana Stalks</option>
        </select>
        <br /><br />

        <label style={{ fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block' }}>Preferred Pickup Date:</label>
        <input
          type="date"
          value={pickupDate}
          onChange={handlePickupDateChange}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
          required
        />
        <br /><br />

        <label style={{ fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block' }}>Emergency Contact Number:</label>
        <input
          type="tel"
          value={emergencyContact}
          onChange={handleEmergencyContact}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
        />
        <br /><br />

        <label style={{ fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block' }}>District:</label>
        <select
          value={district}
          onChange={handleDistrictChange}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
          required
        >
          <option value="Malabe">Malabe</option>
          <option value="Other">Other</option>
        </select>
        <br /><br />

        {district === 'Other' && (
          <>
            <label style={{ fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block' }}>Please specify the district:</label>
            <input
              type="text"
              value={otherDistrict}
              onChange={handleOtherDistrictChange}
              style={{
                width: '100%',
                padding: '10px',
                margin: '10px 0',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
              }}
              placeholder="Enter District"
            />
            <br /><br />
          </>
        )}

        <label style={{ fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block' }}>Location:</label>
        <LoadScript googleMapsApiKey="AIzaSyBvdWTRDRIKWd11ClIGYQrSfc883IEkRiw">
          <GoogleMap
            id="map"
            mapContainerStyle={{ width: '100%', height: '400px' }}
            center={{ lat: 6.9271, lng: 79.9730 }}
            zoom={12}
            onClick={handleMapClick}
          >
            {location.length > 0 && <Marker position={{ lat: location[0].lat, lng: location[0].long }} />}
          </GoogleMap>
        </LoadScript>
        <br /><br />

        <button
          type="submit"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '12px 20px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            marginTop: '20px',
          }}
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default DeliveryForm;
