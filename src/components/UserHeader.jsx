import { Box, VStack, Flex, Text, Link } from '@chakra-ui/layout';
import { Avatar } from '@chakra-ui/avatar';
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { Image, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, useDisclosure, useToast, Divider, useColorMode } from '@chakra-ui/react';
import userAtom from '../atoms/userAtom';
import { useRecoilValue } from 'recoil';
import { Button } from '@chakra-ui/react';
import { Link as ReactRouter, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import useShowToast from './../hooks/useShowToast';
import { useColorModeValue } from '@chakra-ui/react';

const UserHeader = ({ user }) => {
    const [selectedSection, setSelectedSection] = useState("Followers");
    const { colorMode } = useColorMode(); // Get the current color mode
    const borderBottomColor1 = useColorModeValue('black', 'white');
    const borderBottomColor2 = useColorModeValue('#999999', '#999999');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const buttonColor = useColorModeValue('#b7b7b780', '#95959580');
    const toast = useToast();
    const currentUser = useRecoilValue(userAtom); //logged in user
    const [following, setFollowing] = useState(user.followers.includes(currentUser?._id)); // Null check added here
    const showToast = useShowToast();
    const [updating, setUpdating] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [followingUsers, setFollowingUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Function to fetch followers data from the API
        const fetchFollowers = async () => {
            try {
                const response = await fetch(`/api/users/followers/${user._id}`);
                const data = await response.json();
                setFollowers(data); // Assuming the API returns an array of follower objects
            } catch (error) {
                console.error('Error fetching followers:', error);
            }
        };
        // Call the fetchFollowers function when the component mounts
        // and after follow/unfollow to update follower count
        fetchFollowers();
        // Cleanup function to prevent memory leaks
        return () => { };
    }, [user._id, following]); // Add following as a dependency

    useEffect(() => {
        // Function to fetch following users data from the API
        const fetchFollowingUsers = async () => {
            try {
                const response = await fetch(`/api/users/following/${user._id}`);
                const data = await response.json();
                setFollowingUsers(data); // Assuming the API returns an array of following user objects
            } catch (error) {
                console.error('Error fetching following users:', error);
            }
        };
        // Call the fetchFollowingUsers function when the component mounts
        // and after follow/unfollow to update following users list
        fetchFollowingUsers();
        // Cleanup function to prevent memory leaks
        return () => { };
    }, [user._id, following]); // Add following as a dependency

    const copyURL = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => toast({
            position: 'top',
            title: 'Profile link copied !',
            status: 'success',
            duration: 2000,
        }));
    };

    const handleFollowUnfollow = async () => {
        if (!currentUser) {
            showToast("Error", "Please login to follow", "error");
            return;
        }
        if (updating) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/users/follow/${user._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            if (following) {
                showToast("Success", `Unfollowed ${user.name}`, "success");
                user.followers.pop();
            } else {
                showToast("Success", `Followed ${user.name}`, "success");
                user.followers.push(currentUser?._id);
            }
            setFollowing(!following);
        } catch (error) {
            showToast("Error", error, "error");
        } finally {
            setUpdating(false);
        }
    };

    const handleSectionClick = (section) => {
        setSelectedSection(section);
    };

    const renderUsersList = (users) => {
        return users.map((user, index) => (
            <React.Fragment key={index}>
                <Flex alignItems={'center'} my={3} onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${user.username}`);
                    onClose();
                }} cursor={"pointer"}>
                    <Avatar size='md' name={user.name} src={user.profilePic} mr={3} />
                    <Flex flexDirection={"column"}>
                        <Flex alignItems={'center'}>
                            <Text fontSize={'sm'} fontWeight="bold" cursor={"pointer"}>{user.username}</Text>
                            <Image src="/verified.png" w={4} h={4} ml={1} />
                        </Flex>
                        <Text fontSize={'sm'} cursor={"pointer"}>{user.name}</Text>
                    </Flex>
                </Flex>
                {index !== users.length - 1 && <Divider />}
            </React.Fragment>
        ));
    };

    return (
        <VStack gap={4} alignItems={"start"}>
            <Flex justifyContent={"space-between"} w={"full"}>
                <Box>
                    <Text fontSize={"2xl"} fontWeight={"bold"}>
                        {user.name}
                    </Text>
                    <Flex gap={2} alignItems={"center"}>
                        <Text fontSize={"sm"}>{user.username}</Text>
                        <Text fontSize={"xs"} className='bad' p={1} borderRadius={"full"}>
                            threads.net
                        </Text>
                    </Flex>
                </Box>
                <Box>
                    {user.profilePic && (
                        <Avatar
                            name={user.name}
                            src={user.profilePic}
                            size={{
                                base: "lg",
                                md: "xl"
                            }}
                        />
                    )}
                    {!user.profilePic && (
                        <Avatar
                            name={user.name}
                            src='https://bit.ly/broken-link'
                            size={{
                                base: "lg",
                                md: "xl"
                            }}
                        />
                    )}
                </Box>
            </Flex>
            <Text>{user.bio}</Text>
            {currentUser?._id === user._id && (
                <Link as={ReactRouter} to='/update'>
                    <Button bg={buttonColor} size={'sm'}>Edit Profile</Button>
                </Link>
            )}
            {currentUser?._id !== user._id &&
                <Button bg={buttonColor} size={'sm'} onClick={handleFollowUnfollow} isLoading={updating}>
                    {following ? 'Unfollow' : ' Follow'}</Button>
            }
            <Flex w={"full"} justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    <Link color={"gray.light"} onClick={() => { handleSectionClick("Followers"); onOpen(); }}>{user.followers.length} followers</Link>
                    <Box w={1} h={1} bg={"gray.light"} borderRadius={"full"}></Box>
                    <Link color={"gray.light"} href={`https://www.instagram.com/${user.username}/?hl=en`} target='_blank'>instagram.com</Link>
                </Flex>
                <Flex>
                    <Flex alignItems={"center"} p={2} _hover={{
                        bg: buttonColor,
                        borderRadius: "50%",
                    }}>
                        <Link href={`https://www.instagram.com/${user.username}/?hl=en`} target='_blank'>
                            <BsInstagram size={24} cursor={"pointer"} title='instagram' />
                        </Link>
                    </Flex>
                    <Menu>
                        <MenuButton title='copy'>
                            <Box className='icon-container'>
                                <CgMoreO size={24} cursor={"pointer"} />
                            </Box>
                        </MenuButton>
                        <Portal>
                            <MenuList>
                                <MenuItem onClick={copyURL}>Copy link</MenuItem>
                            </MenuList>
                        </Portal>
                    </Menu>
                </Flex>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Flex w={'full'} mb={-4}>
                            <Flex
                                flex={1}
                                borderBottom={`1.6px solid ${selectedSection === "Followers" ? borderBottomColor1 : borderBottomColor2}`}
                                justifyContent={'center'}
                                py="3"
                                cursor={'pointer'}
                                onClick={() => handleSectionClick("Followers")}
                                transition="border-bottom-color 0.6s ease" // Smooth transition
                            >
                                <Text fontWeight={'bold'} fontSize={'sm'} color={colorMode === 'light' ? (selectedSection === "Followers" ? "black" : "#999999") : (selectedSection === "Followers" ? "white" : "#999999")}>Followers</Text>
                            </Flex>
                            <Flex
                                flex={1}
                                borderBottom={`1.6px solid ${selectedSection === "Following" ? borderBottomColor1 : borderBottomColor2}`}
                                justifyContent={'center'}
                                py="3"
                                cursor={'pointer'}
                                color={colorMode === 'light' ? (selectedSection === "Following" ? "black" : "#999999") : (selectedSection === "Following" ? "white" : "#999999")}
                                onClick={() => handleSectionClick("Following")}
                                transition="border-bottom-color 0.4s ease" // Smooth transition
                            >
                                <Text fontWeight={'bold'} fontSize={'sm'}>Following</Text>
                            </Flex>
                        </Flex>
                    </ModalHeader>
                    <ModalBody>
                        {/* Render users list based on the selected section */}
                        {selectedSection === "Followers" && followers.length === 0 ? (
                            <Text fontSize="md" mb={4}>No followers yet.</Text>
                        ) : selectedSection === "Followers" && renderUsersList(followers)}
                        {selectedSection === "Following" && followingUsers.length === 0 ? (
                            <Text fontSize="md" mb={4}>Not following anyone yet.</Text>
                        ) : selectedSection === "Following" && renderUsersList(followingUsers)}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
};

export default UserHeader;
