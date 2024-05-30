"use client"
import { title } from "@/components/primitives";
import {Input} from "@nextui-org/react";
import { ButtonGroup} from "@nextui-org/react";
import React, { useEffect } from 'react';
import {Divider, Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, DropdownItem,NavbarMenuToggle,NavbarMenuItem,NavbarMenu,DropdownTrigger, Dropdown, DropdownMenu, Image} from "@nextui-org/react";

export default function UserDashboard() {
    

	return (
		<div>
    <div className="fixed top-2 left-2 bottom-2 p-4 bg-slate-500 rounded-r-2xl rounded-l-2xl ">
    <div className="flex flex-col align-middle justify-center">
    <Image
		src="img/logo.png"
		width={100}
		height={100}
		/>
    <Divider className="my-3 " />
    <div>
      <p>ACCOUNT</p>
    </div>
    </div>
    </div>
		</div>
	);
}
