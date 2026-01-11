-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 11, 2026 at 02:51 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `petanque`
--

-- --------------------------------------------------------

--
-- Table structure for table `matches2`
--

CREATE TABLE `matches2` (
  `id` int(11) NOT NULL,
  `id_tournament` int(11) NOT NULL,
  `number` int(11) NOT NULL,
  `id_playerA` int(11) NOT NULL,
  `pseudo_A` varchar(100) NOT NULL,
  `id_playerB` int(11) NOT NULL,
  `pseudo_B` varchar(100) NOT NULL,
  `score_V` int(11) NOT NULL,
  `score_L` int(11) NOT NULL,
  `id_winner` int(11) NOT NULL,
  `end` int(11) NOT NULL,
  `round` int(11) NOT NULL,
  `class` decimal(10,0) NOT NULL,
  `groupe` varchar(100) NOT NULL,
  `barrage` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `matches2`
--

INSERT INTO `matches2` (`id`, `id_tournament`, `number`, `id_playerA`, `pseudo_A`, `id_playerB`, `pseudo_B`, `score_V`, `score_L`, `id_winner`, `end`, `round`, `class`, `groupe`, `barrage`) VALUES
(144, 119, 7, 0, '', 0, '', 0, 0, 0, 0, 0, 1, '', 0),
(145, 119, 6, 0, '', 0, '', 0, 0, 0, 0, 0, 2, '', 0),
(146, 119, 5, 0, '', 0, '', 0, 0, 0, 0, 0, 2, '', 0),
(147, 119, 4, 4, 'Test4', 8, 'Test8', 0, 0, 0, 0, 0, 4, '', 0),
(148, 119, 3, 3, 'Test3', 7, 'Test7', 0, 0, 0, 0, 0, 4, '', 0),
(149, 119, 2, 2, 'Test2', 6, 'Test6', 0, 0, 0, 0, 0, 4, '', 0),
(150, 119, 1, 1, 'Test1', 5, 'Test5', 0, 0, 0, 0, 0, 4, '', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `matches2`
--
ALTER TABLE `matches2`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `matches2`
--
ALTER TABLE `matches2`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=151;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
