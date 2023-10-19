// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Box, Input, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, useDisclosure, useMediaQuery } from "@chakra-ui/react"
import React from "react"

const Search = () => {
    const [isLargeScreen] = useMediaQuery('(min-width: 1200px)')
    const { isOpen, onToggle, onClose } = useDisclosure()
    return (<Box position={isLargeScreen ? "fixed" : null} left={isLargeScreen ? "-50px" : null} top="5px" display="flex" alignItems="center" justifyContent="center" zIndex={10000} width="100%">
        <Input width="500px" variant="flushed" placeholder="Search your logs..." onFocus={onToggle} onBlur={onToggle}/>
        <Popover
            returnFocusOnClose={false}
            isOpen={isOpen}
            onClose={onClose}
            placement='bottom'
            closeOnBlur={false}
            autoFocus={false}
        >
            <PopoverTrigger>
                <Box position="absolute" top="40px"></Box>
            </PopoverTrigger>
            <PopoverContent width={500}>
                <PopoverBody>
                    Are you sure you want to continue with your action?
                </PopoverBody>
            </PopoverContent>
        </Popover>
    </Box>)
}

export default Search