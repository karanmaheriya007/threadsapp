import { Flex, Text, Box } from '@chakra-ui/layout';
import { Avatar } from '@chakra-ui/avatar';
import { Image, Divider, Button, Spinner } from '@chakra-ui/react';
import Actions from '../components/Actions';
import useGetUserProfile from '../hooks/useGetUserProfile';
import useShowToast from '../hooks/useShowToast';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import { DeleteIcon } from '@chakra-ui/icons';
import Comment from './../components/Comment';
import postsAtom from '../atoms/postsAtom';

const PostPage = () => {
    const navigate = useNavigate();
    const { user, loading } = useGetUserProfile();
    const [posts, setPosts] = useRecoilState(postsAtom)
    const showToast = useShowToast();
    const { pid } = useParams();
    const currentUser = useRecoilValue(userAtom);
    const currentPost = posts[0];

    useEffect(() => {
        const getPost = async () => {
            setPosts([]);
            try {
                const res = await fetch(`/api/posts/${pid}`)
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                // console.log(data);
                setPosts([data]);
            } catch (error) {
                showToast("Error", error, "error");
            }
        }
        getPost();
    }, [showToast, pid, setPosts])

    const handleDeletePost = async () => {
        try {
            if (!window.confirm("Are you sure you want to delete this post?")) return;
            const res = await fetch(`/api/posts/${currentPost._id}`, {
                method: "DELETE",
            })
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            showToast("Success", data.message, "success");
            navigate(`/${user.username}`)
        } catch (error) {
            showToast("Error", error, "error");
        }
    }

    if (!user && loading) {
        return (
            <Flex justifyContent={"center"}>
                <Spinner size={"xl"} />
            </Flex>
        )
    }

    if (!currentPost) return null;

    return (
        <>
            <Flex>
                <Flex w={'full'} alignItems={'center'} gap={3}>
                    <Avatar src={user.profilePic} size={'md'} name='Mark Zuckerberg'
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/${user.username}`)
                        }}
                        cursor={"pointer"}></Avatar>
                    <Flex justifyContent={'space-between'} w={'full'}>
                        <Flex w={'full'} alignItems={'center'}>
                            <Text fontSize={'sm'} fontWeight={'bold'}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/${user.username}`)
                                }}
                                cursor={"pointer"}>{user?.username}</Text>
                            <Image src="/verified.png" w={4} h={4} ml={1} />
                            <Flex width={'full'} gap={4} ml={"5px"} alignItems={'center'}>
                                <Text fontSize={'xs'} color={'gray.light'}>
                                    {formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: false })} ago
                                </Text>
                            </Flex>
                            {currentUser?._id === user._id && <Flex>
                                <DeleteIcon size={20} cursor={"pointer"} onClick={handleDeletePost} />
                            </Flex>}
                        </Flex>
                    </Flex>
                </Flex>
                <Flex gap={4} alignItems={'center'}>
                </Flex>
            </Flex>
            <Text my={3}>{currentPost.text}</Text>
            {/* if post.img then return Box */}
            {
                currentPost.img && (
                    <Box borderRadius={6} overflow="hidden" border="1px solid" borderColor="gray.light" w="95%">
                        <Image src={currentPost.img} w="100%" h="100%" objectFit="cover" />
                    </Box>
                )
            }
            <Flex gap={3} my={1}>
                <Actions post={currentPost} />
            </Flex>
            {/* <Flex gap={2} alignItems={"center"}>
                <Text color={"gray.light"} fontSize={'sm'}>123 replies</Text>
                <Box w={0.5} h={0.5} bg={"gray.light"} borderRadius={"full"}></Box>
                <Text color={"gray.light"} fontSize={'sm'}>{998} likes</Text>
            </Flex> */}
            <Divider my={4} />
            <Flex justifyContent={'space-between'}>
                <Flex gap={2} alignItems={'center'}>
                    <Text fontSize={'2xl'}>
                        👏
                    </Text>
                    <Text color={'gray.light'}>Get the app to like,reply and post.</Text>
                </Flex>
                <Button>
                    Get
                </Button>
            </Flex>
            <Divider my={4} />
            {currentPost.replies.map((reply) => (
                <Comment key={reply._id} reply={reply} lastReply={reply._id === currentPost.replies[currentPost.replies.length - 1]._id} />
            ))}
        </>
    )
}

export default PostPage
