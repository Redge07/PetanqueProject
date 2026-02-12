-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 12, 2026 at 08:51 PM
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
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `id` int(11) NOT NULL,
  `id_tournament` int(11) DEFAULT NULL,
  `id_playerA` int(11) DEFAULT NULL,
  `id_playerB` int(11) DEFAULT NULL,
  `pseudoA` varchar(100) NOT NULL,
  `pseudoB` varchar(100) NOT NULL,
  `scoreA` int(11) DEFAULT NULL,
  `scoreB` int(11) DEFAULT NULL,
  `id_winner` int(11) DEFAULT NULL,
  `round` int(11) DEFAULT NULL,
  `groupe` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `score_A` int(11) DEFAULT NULL,
  `score_B` int(11) DEFAULT NULL,
  `id_winner` int(11) NOT NULL,
  `end` int(11) NOT NULL,
  `round` int(11) NOT NULL,
  `class` double NOT NULL,
  `groupe` varchar(100) NOT NULL,
  `barrage` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `id` int(11) NOT NULL,
  `pseudo` varchar(100) DEFAULT NULL,
  `id_versus` int(11) DEFAULT NULL,
  `class` double DEFAULT NULL,
  `id_tournament` int(11) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `valider` int(11) DEFAULT NULL,
  `numero` int(11) DEFAULT NULL,
  `round` int(11) DEFAULT NULL,
  `groupe` varchar(10) DEFAULT NULL,
  `dispo` int(11) DEFAULT NULL,
  `barrage` int(11) DEFAULT NULL,
  `matches` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`id`, `pseudo`, `id_versus`, `class`, `id_tournament`, `id_user`, `valider`, `numero`, `round`, `groupe`, `dispo`, `barrage`, `matches`) VALUES
(3026, 'Regis', 0, 0, 294, 17, 1, 1, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `push_tokens`
--

CREATE TABLE `push_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `last_position_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `push_tokens`
--

INSERT INTO `push_tokens` (`id`, `token`, `user_id`, `created_at`, `latitude`, `longitude`, `last_position_at`) VALUES
(8, 'ExponentPushToken[djCUPqARc4alXSp_oNeMY2]', 17, '2026-02-08 19:11:47', 43.6048744, 1.4365924, '2026-02-09 06:33:11'),
(10, 'ExponentPushToken[djCUPqARc4alXSp_oNeMY2]', 19, '2026-02-09 04:53:53', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tournaments`
--

CREATE TABLE `tournaments` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `admin` int(11) DEFAULT NULL,
  `style` varchar(50) DEFAULT NULL,
  `start` int(11) DEFAULT 0,
  `nb_joueurs` int(11) DEFAULT NULL,
  `vainqueur` varchar(100) DEFAULT NULL,
  `PA` int(11) DEFAULT NULL,
  `PB` int(11) DEFAULT NULL,
  `PB2` int(11) DEFAULT NULL,
  `PC` int(11) DEFAULT NULL,
  `vainqueurA` varchar(100) DEFAULT NULL,
  `vainqueurB` varchar(100) DEFAULT NULL,
  `vainqueurC` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tournaments`
--

INSERT INTO `tournaments` (`id`, `name`, `admin`, `style`, `start`, `nb_joueurs`, `vainqueur`, `PA`, `PB`, `PB2`, `PC`, `vainqueurA`, `vainqueurB`, `vainqueurC`) VALUES
(268, 'Euro', 19, 'arbre', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(294, 'Euro', 17, 'arbre', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(295, 'Le goat', 17, 'cascade', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `pseudo` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `pseudo`, `password`) VALUES
(17, 'Regis', 'aaaaaa'),
(19, 'Bapt10m', 'g');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `matches2`
--
ALTER TABLE `matches2`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `push_tokens`
--
ALTER TABLE `push_tokens`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tournaments`
--
ALTER TABLE `tournaments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=818;

--
-- AUTO_INCREMENT for table `matches2`
--
ALTER TABLE `matches2`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3856;

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3027;

--
-- AUTO_INCREMENT for table `push_tokens`
--
ALTER TABLE `push_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tournaments`
--
ALTER TABLE `tournaments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=296;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
