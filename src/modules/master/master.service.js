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
const getDoctors       = (centerCode, employeeCode, userId) =>
  repo.loadDoctorMapping(centerCode, employeeCode, userId);
 
const insertDoctorMapping = (data)         => repo.insertDoctorMapping(data);
const removeDoctorMapping = (employeeCode) => repo.removeDoctorMapping(employeeCode);


const getAllCategories      = (centerCode)                => repo.loadAllCategory(centerCode);
const getServiceByCategory = (categoryCode, centerCode)  => repo.loadServiceByCategory(categoryCode, centerCode);
 

module.exports = {
  getCenters, createClinic, deleteClinic,
  getDepartments, createDepartment, deleteDepartment,
  getCountries, getNationalities,
  getPractitioners, getRooms, getDoctors,insertDoctorMapping,removeDoctorMapping,getAllCategories,getServiceByCategory,
};