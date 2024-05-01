import { Flex, Text } from '@chakra-ui/layout';
import { Avatar } from '@chakra-ui/avatar';
import { Divider, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Comment = ({ reply, lastReply }) => {
    const navigate = useNavigate();
    return (
        <>
            <Flex gap={4} py={2} my={2} w={'full'}>
                <Avatar src={reply.userProfilePic} size={'sm'}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${reply.username}`)
                    }} cursor={"pointer"} />
                <Flex gap={1} w={'full'} flexDirection={'column'}>
                    <Flex w={'full'} alignItems={'center'}>
                        <Text fontSize={'sm'} fontWeight="bold" onClick={(e) => {
                            e.preventDefault();
                            navigate(`/${reply.username}`)
                        }} cursor={"pointer"}>{reply.username}</Text>
                        <Image src="/verified.png" w={4} h={4} ml={1} />
                    </Flex>
                    <Text>{reply.text}</Text>
                </Flex>
            </Flex>
            {!lastReply ? <Divider /> : null}
        </>
    )
}

export default Comment
