import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Linking,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import ProfileBox from '../components/ProfileBox';
import CustomProfileBox from '../components/UserProfileBox';
import { api } from '../utils';
import SearchBar from '../components/SearchBar';
import AlertModal from '../components/NotLoggedInAdding';
import OverwriteAlertModal from '../components/NotLoggedInOverwriting';
import FilterModal from '../components/FilterModal';
import { colors, typography, borderRadius, shadows } from '../theme';
import LoginModal from '../components/LogInModal';
import RegisterModal from '../components/RegisterModal';
import { handleFileSelect } from '../components/FileSelector';
import AddCreatorModal from '../components/AddCreatorModal';
import CustomAlert from '../components/CustomAlert';

const screenWidth = Dimensions.get('window').width;
const boxWidth = 150; // Set your desired profile box width
const margin = 10; // Spacing between boxes
const columns = Math.floor(screenWidth / (boxWidth + margin * 2));
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Add LoadingOverlay component for better user feedback during slow operations
const LoadingOverlay = ({ visible, message }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.neonBlue} />
        <Text style={styles.loadingText}>{message || "Loading..."}</Text>
      </View>
    </View>
  );
};

const App = ({/*route,*/ navigation }) => {
  const [allProfiles, setAllProfiles] = useState([]); // Keep the original list
  const [filterProfiles, setFilterProfiles] = useState([]); // Keep the list of mapped urls and their users
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavePopup, setShowSavePopup] = useState(false); 
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showOverwriteAlertModal, setShowOverwriteAlertModal] = useState(false);
  const [alertModalConfig, setAlertModalConfig] = useState({
    title: '',
    message: '',
    buttons: []
  }); // TODO: Maybe also add an alert for going from logged in to not logged in (if you had drtopped a file you now deleted)
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [algoResults, setAlgoResults] = useState({}); // Store algorithm ranking dict
  const [sortOn, setSortOn] = useState(false); // State for sorting profiles

  const [isDataFetching, setIsDataFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading..."); // Add this state for custom loading messages

  // State for Creator Form
  const [creatorModal, setCreatorModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSortAlert, setShowSortAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [creatorData, setCreatorData] = useState(null);
  const [userProfileKey, setUserProfileKey] = useState(0); // Add this new state variable
  const [tempJsonFile, setTempJsonFile] = useState(null); // Add this state variable

  const scrollAnim = new Animated.Value(0); // Tracks scroll (Y-axis) position
  const offsetAnim = new Animated.Value(0); // TODO Use later for snapping footer back in place
  const popupOpacity = useRef(new Animated.Value(0)).current;

  const clampedScroll = Animated.diffClamp(
    Animated.add(scrollAnim, offsetAnim),
    0,
    navbarHeight
  );

  const footerTranslate = clampedScroll.interpolate({
    inputRange: [0, navbarHeight],
    outputRange: [0, isNotificationVisible ? -navbarHeight : 0], // Adjust based on notification visibility
    extrapolate: 'clamp',
  });

  const footerOpacity = clampedScroll.interpolate({
    inputRange: [0, navbarHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const rows = Math.ceil(profiles.length / columns);
    const boxHeight = 160; // Height of each profile box
    const verticalMargin = 15; // Margin between boxes
    const minHeight = rows * (boxHeight + verticalMargin) + 100; // Added padding for header
    setContentHeight(minHeight);
  }, [profiles.length]);

  const handleFilter = () => {
    setIsFilterModalVisible(true);
  };

  const handleSortProfiles = () => {
    // // Check if algoResults is populated
    // if (sortOn) {
    //   setSortOn(false);
    //   setProfiles([...allProfiles]);}
    // else {
    //   setSortOn(true);
    // }

    // if (Object.keys(algoResults).length === 0) {
    //   Alert.alert('Notice', 'No algorithm results to sort by.');
    //   return;
    // }

    // // Sort profiles by their algo score
    // const sortedProfiles = [...profiles].sort((a, b) => {
    //   const scoreA = algoResults[a.UserName] || 0;
    //   const scoreB = algoResults[b.UserName] || 0;
    //   return scoreB - scoreA; // Descending order
    // });

    // console.log("Sorted Profiles:", sortedProfiles);
    // setProfiles(sortedProfiles);

    // HyperParameter Tuning on Sorting Algorithm still needs to be done

    setShowSortAlert(true);
    // Hide the alert after 3 seconds
    setTimeout(() => {
      setShowSortAlert(false);
    }, 3000);
  };
  
  const handleSelectPlatform = (selectedPlatforms) => {
    if (selectedPlatforms.length === 0) {
      // If no platforms are selected, reset to all profiles
      setProfiles([...allProfiles]);
      return;
    }
  
    // Filter profiles based on the selected platforms
    const filteredProfiles = allProfiles.filter((profile) =>
      selectedPlatforms.every((platform) => {
        let normalizedPlatform = platform.toLowerCase();

        if (normalizedPlatform === 'x') {
          normalizedPlatform = 'twitter';
        }

        return (
          profile[`${normalizedPlatform}_url`] &&
          profile[`${normalizedPlatform}_url`].trim() !== '' &&
          profile[`${normalizedPlatform}_url`].trim() !== undefined
        );
      })
    );
  
    setProfiles(filteredProfiles);
  };

  const handleShowPopup = () => {
    setShowSavePopup(true);
    
    popupOpacity.setValue(0);
    
    Animated.timing(popupOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }

  const handleClosePopup = () => {
    Animated.timing(popupOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowSavePopup(false);
    });
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      // If the search query is empty, reset to all profiles
      setProfiles([...allProfiles]);
    } else {
      // Filter profiles based on the search query
      const filteredProfiles = allProfiles.filter((profile) =>
      profile.UserName.toLowerCase().includes(query.toLowerCase())
    );
      setProfiles(filteredProfiles);
    }

  };

  const handleLogin = () => {
    console.log('Opening login modal');
    setShowLoginModal(true);
  };

  const processFollowingFromJson = async (jsonFile) => {
    console.log('Processing JSON file:', { hasData: !!jsonFile });
    if (isDataFetching) {
      console.log('Data fetch already in progress, skipping');
      return;
    }
    setIsDataFetching(true);
    setLoadingMessage("Analyzing your TikTok data... This might take a moment.");
    
    try {
      if (!jsonFile || Object.keys(jsonFile).length === 0) {
        console.log('Empty or invalid JSON file');
        Alert.alert('Notice', 'The JSON file is empty or invalid.');
        return;
      }

      let profile = jsonFile.Profile || {};
      if (!Object.keys(profile).includes("Following List")) {
        profile = jsonFile.Activity || {};
      }
      const followingList = profile["Following List"]?.Following || [];
      console.log('Found following list:', { count: followingList.length });

      if (followingList.length === 0) {
        console.log('No following data found');
        Alert.alert('Notice', 'No "following" data found in JSON file.');
        return;
      }

      const prof = followingList.map(profile => {
        if (profile.UserName) {
          return profile.UserName;
        } else {
          console.warn('Invalid following entry, missing UserName:', profile);
          return null;
        }
      }).filter(Boolean);

      console.log('Processed usernames:', { count: prof.length });

      if (prof.length === 0) {
        console.log('No valid usernames found');
        Alert.alert('Notice', 'No valid usernames found in the following list.');
        return;
      }

      // Process profiles in chunks
      const processProfileChunk = async (chunk, chunkIndex, totalChunks) => {
        // Update loading message to show progress
        setLoadingMessage(`Finding cross-platform profiles (${chunkIndex}/${totalChunks})...`);
        
        console.log('Processing chunk:', { size: chunk.length });
        try {
          const response = await api.post(
            '/api/profile-mapping/',
            { prof: chunk },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          console.log('Chunk response:', { 
            status: response.status, 
            profilesCount: response.data?.profiles?.length 
          });
          return response.data?.profiles || [];
        } catch (error) {
          console.error('Chunk processing error:', error);
          return [];
        }
      };

      // Split array into chunks of 30
      const chunks = [];
      for (let i = 0; i < prof.length; i += 30) {
        chunks.push(prof.slice(i, i + 30));
      }
      console.log('Created chunks:', { count: chunks.length });

      // Process all chunks and combine results
      const allMappedProfiles = [];
      let j = 0;
      for (const chunk of chunks) {
        const chunkProfiles = await processProfileChunk(chunk, j + 1, chunks.length);
        allMappedProfiles.push(...chunkProfiles);
        j++;
      }

      console.log('All profiles processed:', { count: allMappedProfiles.length });
      setProfiles([...allMappedProfiles]);
      setAllProfiles([...allMappedProfiles]);

      Alert.alert('Success', 'Profiles successfully mapped from your data!');
    } catch (error) {
      console.error('Profile processing error:', {
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Error', 'Failed to process profiles.');
    } finally {
      setIsDataFetching(false);
    }
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    setAccountName('');
    setEmail(''); // Make sure email is cleared
    setCreatorData(null); // Clear creator data
    setUserProfileKey(prevKey => prevKey + 1); // Force re-render of UserProfileBox
  };

  // PlaceHolder for file drop
  const handleFileDrop = async () => {

    if (allProfiles.length > 0) {
      const confirmOverwrite = await new Promise((resolve) => {
        setShowOverwriteAlertModal(true);
        setAlertModalConfig({
          title: "Warning: Existing Data",
          message: "You currently have profile data loaded in your account. Uploading a new file may overwrite your existing data. Would you like to proceed?",
          buttons: [
            {
              text: "Cancel",
              style: "secondary",
              onPress: () => {
                setShowOverwriteAlertModal(false);
                resolve(false);
              }
            },
            {
              text: "Continue", 
              style: "primary",
              onPress: () => {
                setShowOverwriteAlertModal(false);
                resolve(true);
              }
            }
          ]
        });
      });

      if (!confirmOverwrite) {
        return;
      }
    }

    const file = await handleFileSelect();
    let response = null;
    const formData = new FormData();

    try {
        if (!file) {
            Alert.alert('Error', 'No file was selected.');
            return;
        }

        if (Platform.OS === 'web') {
            formData.append('file', file);
        } else {
            formData.append('file', {
                uri: file.uri,
                name: file.name,
                type: file.type,
            });
        }

        // Make sure email is properly encoded in the URL if it exists
        const encodedEmail = email ? encodeURIComponent(email) : null;
        
        // Process the JSON file - use different endpoints based on login status
        const uploadUrl = encodedEmail ? `/api/upload-json/${encodedEmail}/` : '/api/upload-json/';
        response = await api.post(uploadUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        if (response?.status === 200) {
            Alert.alert('Success', response.data?.message || `File "${file.name}" uploaded successfully!`);
        } else {
            console.error('Error response:', response?.data);
            Alert.alert('Error', response?.data?.error || 'An error occurred while uploading the file.');
            return;
        }
            
        // Only proceed with S3 upload if user is logged in
        if (isLoggedIn && encodedEmail) {
            const file_type = file.type === 'application/json' ? 'json' : 'png';
            
            try {
                // Call the backend to generate pre-signed URLs
                const s3Response = await api.post(`/aws/generate_presigned_url/${encodedEmail}/${file_type}/`);
                
                if (!s3Response.data) {
                    throw new Error('Failed to generate presigned URLs');
                }

                const { user_presigned_url, general_presigned_url } = s3Response.data;

                // Upload file to user-specific folder
                const userUploadResponse = await fetch(user_presigned_url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type,
                    },
                    body: file
                });

                if (!userUploadResponse.ok) {
                    throw new Error('Failed to upload to user folder');
                }

                // Upload file to general folder
                const generalUploadResponse = await fetch(general_presigned_url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type,
                    },
                    body: file
                });

                if (!generalUploadResponse.ok) {
                    throw new Error('Failed to upload to general folder');
                }

                Alert.alert('Success', 'File uploaded successfully to S3 and processed!');
            } catch (s3Error) {
                console.error('S3 upload error:', s3Error);
                Alert.alert(
                    'Warning',
                    'File was processed but failed to upload to S3. Please try uploading again.'
                );
                return;
            }
        }
    } catch (error) {
        console.error('File upload error:', error.message);
        if (error.response) {
            Alert.alert('Error', error.response?.data?.error || 'An unexpected error occurred.');
        } else {
            Alert.alert('Error', 'An unexpected error occurred.');
        }
        return;
    }

    // Process following data after a successful file upload
    try {
        let { following } = response?.data || {};

        if (following && !Array.isArray(following)) {
          try {
            following = following["Following"];
            if (following["Following"].size > 0) {
              following = following["Following"];
            } else {
              throw new Error('No "Following" property found in the object.');
            }
          } catch (error) {
            console.error("Error:", error.message);
            Alert.alert('Error', 'No "following" data found in the uploaded JSON file.');
          }
        }

        if (following && Array.isArray(following)) {
            const prof = following
                .map(profile => profile.UserName || null) // Map valid usernames or null
                .filter(Boolean); // Remove null values

            if (prof.length === 0) {
                Alert.alert('Error', 'No valid usernames found in the following list.');
                return;
            }

            const chunkArray = (array) => {
              const result = [];
              for (let i = 0; i < array.length; i += 100) { // Maybe we Decide to change the 100 to smth smaller
                  result.push(array.slice(i, i + 100));
              }
              return result;
            }

            const profileChunks = chunkArray(prof);
            const mappedProfiles = [];
            
            // Set loading state before starting chunk processing
            setIsLoading(true);
            setLoadingMessage(`Preparing to map ${prof.length} profiles across platforms...`);
            
            let j = 0;
            for (const chunk in profileChunks) {              
              try{
                // Update loading message with progress information
                setLoadingMessage(`Mapping profiles step (${j + 1}/${profileChunks.length})...
                Found ${mappedProfiles.length} matches so far`);
                
                const mappedProfilesResponse = await api.post(
                    '/api/profile-mapping/',
                    { prof: profileChunks[chunk] },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log("Mapped Profiles Response", mappedProfilesResponse);
                mappedProfiles.push(...mappedProfilesResponse.data?.profiles || []);
                j++;

              } catch (error) {
                console.error('Chunk Profile mapping error:', error.response?.data || error.message);
                Alert.alert('Error', 'Failed to process profiles.');
              }
            }

            // Clear loading state after processing is complete
            setIsLoading(false);
            
            setProfiles([...mappedProfiles]);
            setAllProfiles([...mappedProfiles]);
            
            if (!isLoggedIn) {
              setShowSavePopup(true);
              console.log("SHOWING SAVE POPUP")
              handleShowPopup();
            }

            Alert.alert('Success', 'Profiles successfully mapped!');
        } else {
            Alert.alert('Error', 'No "following" data found in the uploaded JSON file.');
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            Alert.alert('Error', 'Failed to parse the JSON file. Ensure the file contains valid JSON.');
        } else {
            console.error('Profile mapping error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to process profiles.');
        }
    }

  // Commenting out Ranking ALgorithm for performance reasons

  //   response = await api.post('/api/personalized-algorithm-data/', formData, {
  //     headers: {
  //         'Content-Type': 'multipart/form-data',
  //     },
  // });

  // let liked_vids = [];
  // let bookmarked_vids = [];

  // if (response?.status === 200) {
  //     Alert.alert('Success', response.data?.message || `File "${file.name}" uploaded successfully!`);

  //     liked_vids = response.data.dict.Likes;
  //     bookmarked_vids = response.data.dict.Bookmarks;
  // }
  // else {
  //   Alert.alert('Error', response?.data?.error || 'An error occurred while uploading the file.');
  // }

  // const batchSize = 30;
  // const batches = [];
  // let results = {};

  // // Split likes and bookmarks into batches of 100
  // for (let i = 0; i < liked_vids.length; i += batchSize) {
  //   batches.push({ Likes: liked_vids.slice(i, i + batchSize), Bookmarks: [] });
  // }
  // for (let i = 0; i < bookmarked_vids.length; i += batchSize) {
  //   batches.push({ Likes: [], Bookmarks: bookmarked_vids.slice(i, i + batchSize) });
  // }

  // let updatedResults = {};

  // for (let i = 0; i < batches.length; i++) {
  //     const batch = batches[i];

  //     try {
  //       const response = await api.post('/api/personalized-creator-recommendation/', JSON.stringify(batch), {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       console.log(`Batch ${i + 1} result:`, response);

  //       let scores = response.data.ranked_creators;

  //       console.log("SCORES", scores);

  //       let key = undefined
  //       let value = undefined

  //       for (const creator of Object.values(scores)) {
  //         key = creator.creator_handle
  //         if (key === undefined) {
  //           continue;
  //         }
  //         key = key.replace('@', '');
  //         value = creator.score;
          
  //         if (!results[key]) {
  //           results[key] = 0; // Start with 0 if the key isn't present
  //         }
  //         results[key] += value;
  //       }

  //       console.log('Ranked Creators:', results);
  //       updatedResults = { ...algoResults };
  //       for (const [key, value] of Object.entries(results)) {
  //         if (updatedResults[key]) {
  //           updatedResults[key] += value; // Add to existing value
  //         } else {
  //           updatedResults[key] = value; // Initialize new key
  //         }
  //       }

  //     } catch (error) {
  //       console.error(`Error sending batch ${i + 1}:`, error);
  //     }
  // }
  // setAlgoResults(updatedResults);

};

  // Add this function to fetch creator data
  const fetchCreatorData = async (email) => {
    console.log('Fetching creator data for:', email);
    // Clear previous data first to avoid showing stale information
    setCreatorData(null);
    
    if (!email || email === '') {
      console.log('Skipping creator data fetch: no email provided');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage("Retrieving your creator profile...");
    try {
      const response = await api.get(`/api/get-single-data/${email}/`);
      console.log('Creator data response:', response.data);
      
      if (response.data?.message === "No data found!" || 
          !response.data?.data || 
          response.data.data.length === 0) {
        console.log('No creator data found in API response, setting to null');
        setCreatorData(null);
        return;
      }
      
      // Only set creator data if we actually have data
      const userData = response.data.data[0];
      console.log('Setting creator data:', userData);
      setCreatorData({
        profilePicture: userData.profile_picture_url || '',
        tiktokUsername: userData.tiktok_username || '',
        instagramURL: userData.instagram_username || '',
        xURL: userData.x_username || '',
        facebookURL: userData.facebook_username || '',
      });
    } catch (error) {
      console.error('Error fetching creator data:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      // Explicitly set to null on error
      setCreatorData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the modal opening logic
  const handleCreatorModalOpen = async () => {
    if (isLoggedIn) {
      await fetchCreatorData(email);
      setCreatorModal(true);
    } else {
      setShowAlertModal(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <SearchBar
            onSearch={handleSearch}
            placeholder="Search..."
          />

          {allProfiles.length !== 0 && (
              <TouchableOpacity
                onPress={handleFilter}
                style={styles.filterButton}
              >
                <Text style={styles.filterButtonText}>Filter</Text>
              </TouchableOpacity>
            )}

          <TouchableOpacity
            onPress={handleFileDrop}
            style={allProfiles === null ? styles.changeFileButtonSmall : styles.changeFileButton}>
            <Text style={allProfiles.length !== 0 ? styles.changeFileTextSmall : styles.changeFileText}>
              {allProfiles.length !== 0 ? 'Change File' : 'Add TikTok File'}
            </Text>
          </TouchableOpacity>

          {/* <BulkFollowDropdown onSelectPlatform={handleBulkFollow} /> */}
        </View>

        {/* Dynamic Profile Boxes */}
        <Animated.ScrollView
          style={[
            styles.profilesContainer,
            { minHeight: contentHeight }
          ]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <View style={[
            styles.gridContainer,
            { minHeight: contentHeight }
          ]}>
            {profiles.map((profile, index) => (
              <View key={index} style={styles.profileWrapper}>
                <ProfileBox
                  name={profile.UserName}
                  profilePicture={profile.profile_picture}
                  instagramUrl={profile.instagram_url}
                  facebookUrl={profile.facebook_url}
                  twitterUrl={profile.twitter_url}
                  redditUrl={profile.reddit_url}
                />
              </View>
            ))}

            {/* Add the custom box at the end */}
            <View style={styles.profileWrapper}>
              <TouchableOpacity
                style={styles.customBox}
                onPress={handleCreatorModalOpen}
              >
                <View style={styles.profileWrapper}>
                  <CustomProfileBox
                    key={userProfileKey}
                    name={(accountName.trim()) ? `${accountName}` : 'Your Account'}
                    shouldFetchData={true}
                    initialData={null}
                    email={email}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.ScrollView>
      </View>

      {/* Footer */}
      <Animated.View
        style={[
          styles.footer,
          {
            transform: [{ translateY: footerTranslate }], // Applying translation
            opacity: footerOpacity, // Applying opacity
          },
        ]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setNavbarHeight(height); // Just to get the height of the footer
        }}
      >
        <View style={styles.footerLeft}>
          <TouchableOpacity style={styles.sortButton} onPress={handleSortProfiles}>
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
          
          {isLoggedIn ? (
            <TouchableOpacity onPress={handleLogout} style={styles.authButton}>
              <Text style={styles.footerText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleLogin} style={styles.authButton}>
              <Text style={styles.footerText}>SignUp/Login</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.footerCenter}>
          <Text style={styles.footerText}>{accountName}</Text>
        </TouchableOpacity>
          
        <AlertModal
          visible={showAlertModal}
          title="Login Required"
          message="Please log in to add your accout's credentials."
          onClose={() => setShowAlertModal(false)} // Close modal on button press
        />

        <View style={styles.footerRight}>
        </View>
      </Animated.View>

      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={async (userData) => {
          console.log('Login success, processing user data:', { 
            email: userData.email,
            hasJsonFile: !!userData.json_file 
          });
          
          setIsLoggedIn(true);
          setEmail(userData.email);
          setAccountName(`${userData.first_name} ${userData.last_name}`);
          setUserProfileKey(prevKey => prevKey + 1); // Force re-render when user changes
          
          try {
            // Sequential processing to prevent race conditions
            if (userData.json_file && Object.keys(userData.json_file).length > 0) {
              console.log('Processing JSON file from login');
              await processFollowingFromJson(userData.json_file);
            }
            console.log('Fetching creator data after login');
            await fetchCreatorData(userData.email);
          } catch (error) {
            console.error('Error in login success handler:', error);
          }
          console.log(`State account user data ${userData.first_name} ${userData.last_name} <-- This should be updated`);
        }}
        onRegisterClick={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      {/* Registration Modal */}
      <RegisterModal
        visible={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegisterSuccess={(userData) => {
          setIsLoggedIn(true);
          setAccountName(`${userData.first_name} ${userData.last_name}`);
          // Clear form data
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          // Process JSON file if exists
          if (userData.json_file && Object.keys(userData.json_file).length > 0) {
            processFollowingFromJson(userData.json_file);
          }
          setShowRegisterModal(false);
          setShowSuccessAlert(true);
        }}
      />

      {/* Success Alert */}
      <CustomAlert
        visible={showSuccessAlert}
        title="Welcome!"
        message="Your account has been created successfully!"
        // onClose={() => setShowSuccessAlert(false)}
        onClose = {() => {
          setShowSuccessAlert(false);
          setShowRegisterModal(false);
        }}
      />

      {/* Creator Modal */}
      <AddCreatorModal
        key={`creator-modal-${email}-${userProfileKey}`} // Add key to force complete re-render
        visible={creatorModal}
        onClose={() => setCreatorModal(false)}
        email={email}
        initialData={creatorData}
        onSubmitSuccess={async () => {  // Make this async
          // Re-fetch creator data to update the UserProfileBox
          if (email && email.trim() !== '') {
            await fetchCreatorData(email);  // Wait for the fetch to complete
            setUserProfileKey(prev => prev + 1); // Now safe to trigger re-render
          }
        }}
      />

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onSelectPlatform={handleSelectPlatform}
      />

      {showSortAlert && (
        <View style={styles.sortAlertOverlay}>
          <View style={styles.sortAlertContent}>
            <Text style={styles.sortAlertTitle}>Coming Soon! 🚀</Text>
            <Text style={styles.sortAlertText}>
              I'm working hard on our sorting algorithm
              to better understand your niches and preferences.{'\n\n'}
              Thank you for your interest - {'\n'}
              I am taking note of this feature's popularity!
            </Text>
          </View>
        </View>
      )}

      <OverwriteAlertModal
        visible={showOverwriteAlertModal}
        title={alertModalConfig.title}
        message={alertModalConfig.message}
        buttons={alertModalConfig.buttons}
      />

      <LoadingOverlay
        visible={isLoading || isDataFetching}
        message={loadingMessage}
      />

      {/* Save Popup */}
      {showSavePopup && (
        <Animated.View style={[
          styles.notificationPopup,
          { 
            opacity: popupOpacity,
            position: 'absolute',
            bottom: 100,
            left: 20,
            right: 20,
            zIndex: 9999
          }
        ]}>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationText}>Login to save your data</Text>
            <TouchableOpacity style={styles.notificationButton} onPress={handleLogin}>
              <Text style={styles.notificationButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.popupCloseButton}
            onPress={handleClosePopup}
          >
            <Text style={styles.popupCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: colors.primaryBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backArrow: {
    fontSize: 24,
    color: colors.neonBlue,
    marginRight: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterButton: {
    backgroundColor: colors.neonPurple,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  filterButtonText: {
    color: colors.primaryText,
    fontSize: typography.button.fontSize,
    fontWeight: 'bold',
  },
  changeFileButton: {
    backgroundColor: colors.neonBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  changeFileText: {
    color: colors.primaryText,
    fontSize: typography.button.fontSize,
    fontWeight: 'bold',
  },
  changeFileButtonSmall: {
    backgroundColor: '#ddd', // Light gray background for less prominence
    paddingVertical: 6, // Smaller padding
    paddingHorizontal: 10, // Smaller width
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc', // Subtle border
  },
  changeFileTextSmall: {
    color: '#555', // Subtle gray text
    fontSize: 12, // Smaller font size
    fontWeight: 'normal', // Normal font weight
  },
  // Profile grid styles
  profilesContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 80, // Space for footer
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 60, // Add padding at the bottom for footer
  },
  profileWrapper: {
    flexBasis: isMobile ? '48%' : `${100 / columns}%`,
    marginBottom: isMobile ? 3 : 10,
    paddingHorizontal: isMobile ? 2 : 8,
  },
  // Footer styles
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.primaryBg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    zIndex: 1000,
  },
  footerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  sortButton: {
    backgroundColor: colors.neonBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: borderRadius.md,
    marginRight: 15,
    ...shadows.sm,
  },
  sortButtonText: {
    color: colors.primaryText,
    fontSize: typography.button.fontSize,
    fontWeight: 'bold',
  },
  authButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  footerCenter: {},
  footerRight: {},
  footerText: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  // Button styles
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signUpButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  signUpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  token: {
    fontWeight: 'bold',
    color: '#FF5722',
  },
  notificationPopup: {
    backgroundColor: colors.secondaryBg,
    padding: 15,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neonBlue,
    marginHorizontal: 15,
    ...shadows.lg,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationText: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize,
    fontWeight: 'bold',
    flex: 1,
  },
  notificationButton: {
    backgroundColor: colors.neonBlue,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: borderRadius.md,
    marginLeft: 10,
    ...shadows.sm,
  },
  notificationButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
  },
  popupCloseButton: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupCloseButtonText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: 'bold',
  },
  greenPlusButton: {
    backgroundColor: '#4CAF50', // Green background
    borderRadius: 50, // Circular button
    width: 30, // Button width
    height: 20, // Button height
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    position: 'absolute', // Place it in a fixed position
    right: 15, // Distance from the right edge of the footer
    bottom: 10, // Distance from the bottom edge of the screen
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 5, // Shadow radius
  },
  
  plusText: {
    color: '#fff', // White text color
    fontSize: 14, // Font size
    fontWeight: 'bold', // Bold font
  },
  uploadButton: {
    backgroundColor: '#4CAF50', // Green background
    paddingVertical: 10, // Padding on top and bottom
    paddingHorizontal: 20, // Padding on left and right
    borderRadius: 5, // Rounded corners
    alignItems: 'center', // Center align text
    justifyContent: 'center', // Center align text
    marginBottom: 15, // Add some spacing at the bottom
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.3, // Shadow transparency
    shadowRadius: 3, // Shadow blur
    elevation: 2, // Shadow for Android
  },
  uploadButtonText: {
    color: '#FFFFFF', // White text color
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold text
  },
  profileImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  sortAlertOverlay: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: borderRadius.lg,
    zIndex: 2000,
    maxWidth: '90%',
    width: 400,
  },
  sortAlertContent: {
    backgroundColor: colors.secondaryBg,
    padding: 20,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
    width: '100%', // Ensure content takes full width
  },
  sortAlertTitle: {
    color: colors.primaryText,
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    width: '100%', // Ensure title takes full width
  },
  sortAlertText: {
    color: colors.secondaryText,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    width: '100%', // Ensure text takes full width
    flexWrap: 'wrap', // Enable text wrapping
    display: 'flex', // Enable flexbox
    marginTop: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.secondaryBg,
    padding: 20,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.primaryText,
    fontSize: typography.body.fontSize,
    fontWeight: 'bold',
    marginTop: 10,
  },
});


export default App;