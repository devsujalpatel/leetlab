import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
	const { email, password, name } = req.body;
	try {
		const existingUser = await db.user.findUnique({
			where: {
				email,
			},
		});
		if (existingUser) {
			return res.status(400).json({
				error: "User already exists",
			});
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await db.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
				role: UserRole.USER,
			},
		});

		const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});
		res.cookie("jwt", token, {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV !== "development",
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
				image: newUser.image,
			},
		});
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({
			error: "Error creating user",
		});
	}
};
export const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await db.user.findUnique({
			where: {
				email,
			},
		});
		if (!user) {
			return res.status(401).json({
				error: "User not found",
			});
		}
		const isMatched = await bcrypt.compare(password, user.password);
		if (!isMatched) {
			return res.status(401).json({
				error: "Invalid Credentials",
			});
		}

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});
		res.cookie("jwt", token, {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV !== "development",
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
		res.status(201).json({
			success: true,
			message: "User Loggedin successfully",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				image: user.image,
			},
		});
	} catch (error) {
		console.error("Error login user:", error);
		res.status(500).json({
			error: "Error Login user",
		});
	}
};
export const logout = async (req, res) => {
	try {
		res.clearCookie("jwt", {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV !== "development",
		});
		res.status(200).json({
			success: true,
			message: "User loged out successfully"
		})
	} catch (error) {
		console.error("Error logout user:", error);
		res.status(500).json({
			error: "Error logout user",
		});
	}
};
export const check = async (req, res) => {
	
};
