-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 12, 2025 at 09:25 PM
-- Server version: 8.0.43-0ubuntu0.24.04.1
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `it_std6630251296`
--

-- --------------------------------------------------------

--
-- Table structure for table `Kanhom`
--

CREATE TABLE `Kanhom` (
  `ID` int NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Image` varchar(300) DEFAULT NULL,
  `Stock` varchar(50) DEFAULT NULL,
  `Catagory` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Kanhom`
--

INSERT INTO `Kanhom` (`ID`, `Name`, `Image`, `Stock`, `Catagory`, `location`, `status`) VALUES
(2, 'Bingsu after you', 'http://nindam.sytes.net/std6630251296/Inventory/uploads/images/4cebfeb9-62e7-4544-98d7-22a6a71844ed.jpg', '9', 'Dessert', 'Branch A', 'Active'),
(3, 'KTC Rico Smoothie', 'http://nindam.sytes.net/std6630251296/Inventory/uploads/images/73160585-b7d7-4217-ae1f-e5afacdb8896.jpg', '25', 'Drinks', 'Branch B', 'Active'),
(11, 'macaron', 'http://nindam.sytes.net/std6630251296/Inventory/uploads/images/b37e4adf-69dc-4b45-8cdb-4c014369182a.jpg', '5', 'Snack', 'Central Wesgate', 'Ready');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Kanhom`
--
ALTER TABLE `Kanhom`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Kanhom`
--
ALTER TABLE `Kanhom`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
