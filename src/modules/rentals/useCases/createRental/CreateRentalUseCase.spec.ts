import dayjs from "dayjs";

import { UsersRepositoryInMemory } from "@modules/accounts/repositories/in-memory/UsersRepositoryInMemory";
import { CarsRepositoryInMemory } from "@modules/cars/repositories/in-memory/CarsRepositoryInMemory";
import { RentalsRepositoryInMemory } from "@modules/rentals/repositories/in-memory/RentalsRepositoryInMemory";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";
import { AppError } from "@shared/errors/AppError";

import { CreateRentalUseCase } from "./CreateRentalUseCase";

let createRentalUseCase: CreateRentalUseCase;
let rentalsRepositoryInMemory: RentalsRepositoryInMemory;
let dayJsDateProvider: DayjsDateProvider;
let carsRepositoryInMemory: CarsRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;

describe("Create Rental", () => {
  const dayAdd24Hours = dayjs().add(1, "day").toDate();
  beforeEach(() => {
    rentalsRepositoryInMemory = new RentalsRepositoryInMemory();
    dayJsDateProvider = new DayjsDateProvider();
    carsRepositoryInMemory = new CarsRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    createRentalUseCase = new CreateRentalUseCase(
      rentalsRepositoryInMemory,
      dayJsDateProvider,
      carsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("should be able to create a new rental", async () => {
    const car = await carsRepositoryInMemory.create({
      name: "Car1",
      description: "Car description",
      daily_rate: 100,
      license_plate: "ABC-1234",
      fine_amount: 60,
      brand: "Car_brand",
      category_id: "category",
    });
    const user = await usersRepositoryInMemory.create({
      driver_license: "000123",
      email: "user@teste.com",
      name: "User Test",
      password: "1234",
    });

    const rental = await createRentalUseCase.execute({
      user_id: user.id,
      car_id: car.id,
      expected_return_date: dayAdd24Hours,
    });

    expect(rental).toHaveProperty("id");
    expect(rental).toHaveProperty("start_date");
  });

  it("should not be able to create a new rental for a car already in use", async () => {
    expect(async () => {
      const car = await carsRepositoryInMemory.create({
        name: "Car1",
        description: "Car description",
        daily_rate: 100,
        license_plate: "ABC-1234",
        fine_amount: 60,
        brand: "Car_brand",
        category_id: "category",
      });
      const user_already_renting = await usersRepositoryInMemory.create({
        driver_license: "000123",
        email: "user@teste.com",
        name: "User Test",
        password: "1234",
      });
      const user_not_yet_renting = await usersRepositoryInMemory.create({
        driver_license: "000123",
        email: "user_not_yet_renting@teste.com",
        name: "user_not_yet_renting",
        password: "1234",
      });

      await createRentalUseCase.execute({
        user_id: user_already_renting.id,
        car_id: car.id,
        expected_return_date: dayAdd24Hours,
      });

      await createRentalUseCase.execute({
        user_id: user_not_yet_renting.id,
        car_id: car.id,
        expected_return_date: dayAdd24Hours,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a new rental for a user already renting another car", async () => {
    expect(async () => {
      const car_rented = await carsRepositoryInMemory.create({
        name: "Car1",
        description: "Car description",
        daily_rate: 100,
        license_plate: "ABC-1234",
        fine_amount: 60,
        brand: "Car_brand",
        category_id: "category",
      });

      const car_not_yet_renting = await carsRepositoryInMemory.create({
        name: "Car2",
        description: "Car description",
        daily_rate: 100,
        license_plate: "ABC-4321",
        fine_amount: 60,
        brand: "Car_brand",
        category_id: "category",
      });

      const user_already_renting = await usersRepositoryInMemory.create({
        driver_license: "000123",
        email: "user@teste.com",
        name: "User Test",
        password: "1234",
      });

      await createRentalUseCase.execute({
        user_id: user_already_renting.id,
        car_id: car_rented.id,
        expected_return_date: dayAdd24Hours,
      });

      await createRentalUseCase.execute({
        user_id: user_already_renting.id,
        car_id: car_not_yet_renting.id,
        expected_return_date: dayAdd24Hours,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a new rental with an invalid return time", async () => {
    expect(async () => {
      const car = await carsRepositoryInMemory.create({
        name: "Car1",
        description: "Car description",
        daily_rate: 100,
        license_plate: "ABC-1234",
        fine_amount: 60,
        brand: "Car_brand",
        category_id: "category",
      });
      const user = await usersRepositoryInMemory.create({
        driver_license: "000123",
        email: "user@teste.com",
        name: "User Test",
        password: "1234",
      });

      await createRentalUseCase.execute({
        user_id: user.id,
        car_id: car.id,
        expected_return_date: dayjs().toDate(),
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
