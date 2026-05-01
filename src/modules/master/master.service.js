const { AppError } = require("../../middlewares/error.middleware");
const repo = require("./master.repository");

const getCenters       = ()                        => repo.loadCenters();
const createClinic     = (data)                    => repo.insertClinic(data);
const deleteClinic     = (code)                    => repo.removeClinic(code);

const getDepartments   = ()                        => repo.loadDepartments();
const createDepartment = (data)                    => repo.insertDepartment(data);
const deleteDepartment = (code)                    => repo.removeDepartment(code);

const getCountries     = ()                        => repo.loadCountries();
const getNationalities = (country)                 => repo.loadNationalities(country);

const getPractitioners = (centerCode)              => repo.loadAllPractitioners(centerCode);
const getRooms         = (centerCode)              => repo.loadRooms(centerCode);
const getDoctors       = (centerCode)              => repo.loadDoctorMapping(centerCode);

module.exports = {
  getCenters, createClinic, deleteClinic,
  getDepartments, createDepartment, deleteDepartment,
  getCountries, getNationalities,
  getPractitioners, getRooms, getDoctors,
};