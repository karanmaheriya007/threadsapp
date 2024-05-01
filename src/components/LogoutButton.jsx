import { Button, useColorModeValue } from "@chakra-ui/react";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { FiLogOut } from "react-icons/fi";

const LogoutButton = () => {
    const setUser = useSetRecoilState(userAtom);
    const showToast = useShowToast();

    const handleLogout = async () => {
        if (!window.confirm("Are you sure you want to logout?")) return; // Confirmation check
        try {
            const res = await fetch("/api/users/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            // console.log(data);
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            localStorage.removeItem("user-threads");
            setUser(null);
            showToast("Success", data.message, "success");
        } catch (error) {
            showToast("Error", error, "error");
        }
    };

    return (
        <Button
            bg={useColorModeValue('gray.300', 'gray.600')}
            mx={"auto"}
            position={"fixed"}
            top={"30px"}
            right={"30px"}
            size={"sm"}
            onClick={handleLogout}
            title="Logout"
        >
            <FiLogOut size={20} />
        </Button>
    );
};

export default LogoutButton;
