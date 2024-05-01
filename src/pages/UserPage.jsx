import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Text, useColorModeValue } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";

const UserPage = () => {
    const borderBottomColor1 = useColorModeValue('black', 'white');
    const borderBottomColor2 = useColorModeValue('#999999', '#999999');
    const [activeTab, setActiveTab] = useState('threads'); // State to manage active tab (threads, replies, reposts)
    const { user, loading } = useGetUserProfile();
    const { username } = useParams();
    const showToast = useShowToast();
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [fetchingPosts, setFetchingPosts] = useState(false);

    useEffect(() => {
        const getPosts = async () => {
            setFetchingPosts(true);
            try {
                const res = await fetch(`/api/posts/user/${username}`);
                const data = await res.json();
                setPosts(data);
                // console.log(data)
            } catch (error) {
                showToast("Error", error.message, "error");
                setPosts([]);
            } finally {
                setFetchingPosts(false);
            }
        };
        getPosts();
    }, [username, showToast, setPosts]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    if (!user && loading) {
        return (
            <Flex justifyContent={"center"}>
                <Spinner size="xl" />
            </Flex>
        );
    }
    if (!user && !loading) {
        return <Text textAlign={'center'}>User not found</Text>;
    }

    return (
        <>
            <UserHeader user={user} />
            {!fetchingPosts && posts.length === 0 && (
                <Flex justifyContent={"center"} mt={"100px"}>
                    <h1>User has no posts.</h1>
                </Flex>
            )}
            {fetchingPosts && (
                <Flex justifyContent={"center"} my={12}>
                    <Spinner size={"xl"} />
                </Flex>
            )}
            <Flex w={'full'} my={3}>
                <Flex
                    flex={1}
                    borderBottom={`1.6px solid ${activeTab === 'threads' ? borderBottomColor1 : borderBottomColor2}`}
                    justifyContent={'center'}
                    py="3"
                    cursor={'pointer'}
                    onClick={() => handleTabClick('threads')}
                    color={activeTab === 'threads' ? borderBottomColor1 : '#999999'}
                >
                    <Text fontWeight={'bold'}>Threads</Text>
                </Flex>
                <Flex
                    flex={1}
                    borderBottom={`1.6px solid ${activeTab === 'replies' ? borderBottomColor1 : borderBottomColor2}`}
                    justifyContent={'center'}
                    py="3"
                    cursor={'pointer'}
                    color={activeTab === 'replies' ? borderBottomColor1 : '#999999'}
                    onClick={() => handleTabClick('replies')}
                >
                    <Text fontWeight={'bold'}>Replies</Text>
                </Flex>
                <Flex
                    flex={1}
                    borderBottom={`1.6px solid ${activeTab === 'reposts' ? borderBottomColor1 : borderBottomColor2}`}
                    justifyContent={'center'}
                    py="3"
                    cursor={'pointer'}
                    color={activeTab === 'reposts' ? borderBottomColor1 : '#999999'}
                    onClick={() => handleTabClick('reposts')}
                >
                    <Text fontWeight={'bold'}>Reposts</Text>
                </Flex>
            </Flex>
            {activeTab === 'threads' && (
                <>
                    {posts.map((post) => {
                        return <Post key={post._id} post={post} postedBy={post.postedBy} />;
                    })}
                </>
            )}
            {activeTab === 'replies' && (
                <Flex justifyContent={"center"} mt={"100px"} height={"50vh"}>
                    <Text color={"#999999"}>No replies yet.</Text>
                </Flex>
            )}
            {activeTab === 'reposts' && (
                <Flex justifyContent={"center"} mt={"100px"} height={"50vh"}>
                    <Text color={"#999999"}>No reposts yet.</Text>
                </Flex>
            )}
        </>
    );
};

export default UserPage;
