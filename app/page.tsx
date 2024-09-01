"use client"

import Introduction from "@/components/Introduction";
import Acerca from "@/components/Acerca";
import Footer from "@/components/Footer";

import React from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, DropdownItem,NavbarMenuToggle,NavbarMenuItem,NavbarMenu,DropdownTrigger, Dropdown, DropdownMenu, Image} from "@nextui-org/react";

export default function Home() {


	const [isMenuOpen, setIsMenuOpen] = React.useState(false);

	const menuItems = [
	  "Profile",
	  "Dashboard",
	  "Activity",
	  "Analytics",
	  "System",
	  "Deployments",
	  "My Settings",
	  "Help & Feedback",
	  "Log Out",
	];


	return (
		<main className="min-h-screen">
		<Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
		<Image
		src="img/logo.png"
		width={100}
		height={100}
		/>
          <p className="font-bold">BuscoCredito</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#" className="text-md">
           Acerca de
          </Link>
        </NavbarItem>
		<NavbarItem>
          <Link color="foreground" href="#">
          ¿Eres prestamista?
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
          ¿Necesitas un préstamo?
          </Link>
        </NavbarItem>
        <NavbarItem>
        <Button as={Link} color="primary" href="/login">
            Login
          </Button>
        </NavbarItem>
        <NavbarItem>
        <Button as={Link} color="primary" href="/signup" variant="flat">
            Sign up
          </Button>
        </NavbarItem>

      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color={
                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              className="w-full"
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>	

        
	<Introduction></Introduction>
    <Acerca></Acerca>
    <Footer></Footer>
		</main>
	);
}
