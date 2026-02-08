cmake_minimum_required(VERSION 3.10)
project(BeeFormerInference CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# In a production environment, we would link llama.cpp here
# include_directories(${LLAMA_CPP_DIR})
# add_subdirectory(llama.cpp)

add_executable(beeformer src/main.cpp)

# target_link_libraries(beeformer llama)

install(TARGETS beeformer DESTINATION bin)
