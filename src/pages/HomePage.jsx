import { Flex, Text, SkeletonCircle, SkeletonText, useColorMode, useColorModeValue } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import useShowToast from './../hooks/useShowToast';
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";

const HomePage = () => {
    const [selectedSection, setSelectedSection] = useState("Following");
    const { colorMode } = useColorMode(); // Get the current color mode
    const borderBottomColor1 = useColorModeValue('black', 'white');
    const borderBottomColor2 = useColorModeValue('#999999', '#999999');
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [loading, setLoading] = useState(true);
    const showToast = useShowToast();

    useEffect(() => {
        const getFeedPosts = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/posts/feed");
                const data = await res.json();
                setPosts(data);
            } catch (error) {
                showToast("Error", error, "error");
            } finally {
                setLoading(false);
            }
        };
        getFeedPosts();
    }, [showToast, setPosts]);

    const handleSectionClick = (section) => {
        setSelectedSection(section);
    };

    return (
        <>
            <Flex w={'full'} mb={3} mt={-5}>
                <Flex
                    flex={1}
                    borderBottom={`1.6px solid ${selectedSection === "Following" ? borderBottomColor1 : borderBottomColor2}`}
                    justifyContent={'center'}
                    py="3"
                    cursor={'pointer'}
                    onClick={() => handleSectionClick("Following")}
                    transition="border-bottom-color 0.6s ease" // Smooth transition
                >
                    <Text fontWeight={'bold'} color={colorMode === 'light' ? (selectedSection === "Following" ? "black" : "#999999") : (selectedSection === "Following" ? "white" : "#999999")}>Following</Text>
                </Flex>
                <Flex
                    flex={1}
                    borderBottom={`1.6px solid ${selectedSection === "Following" ? borderBottomColor2 : borderBottomColor1}`}
                    justifyContent={'center'}
                    py="3"
                    cursor={'pointer'}
                    color={colorMode === 'light' ? (selectedSection === "Following" ? "#999999" : "black") : (selectedSection === "Following" ? "#999999" : "white")}
                    onClick={() => handleSectionClick("For you")}
                    transition="border-bottom-color 0.4s ease" // Smooth transition
                >
                    <Text fontWeight={'bold'}>For you</Text>
                </Flex>
            </Flex>
            {!loading && posts.length === 0 && (
                <Flex justifyContent="center">
                    <Text>No posts available {selectedSection === "For you" ? "for you" : ""}</Text>
                </Flex>
            )}
            {loading ? (
                <Flex direction="column">
                    {[...Array(5)].map((_, index) => (
                        <React.Fragment key={index}>
                            <SkeletonCircle size='12' mt={4} />
                            <SkeletonText key={`text-${index}`} mt='4' noOfLines={4} spacing='4' skeletonHeight='3' />
                        </React.Fragment>
                    ))}
                </Flex>
            ) : (
                selectedSection === "Following" ? (
                    posts.map((post) => (
                        <Post key={post._id} post={post} postedBy={post.postedBy} />
                    ))
                ) : (
                    <Flex justifyContent="center" height={"100vh"} mt={"150px"}>
                        <Text color={"#999999"}>No posts available for you.</Text>
                    </Flex>
                )
            )}
        </>
    );
};

export default HomePage;
