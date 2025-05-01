import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

export default function DropDown() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button className="text-cyan-400 rounded-full px" variant="light">S</Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Action event example" onAction={(key) => alert(key)}>
        <DropdownItem key="new">New file</DropdownItem>
        <DropdownItem key="copy">Copy link</DropdownItem>
        <DropdownItem key="edit">Edit file</DropdownItem>
        <DropdownItem key="delete" className="text-danger" color="danger">
          Delete file
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
