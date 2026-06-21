package com.pt28.cabinetmedical.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pt28.cabinetmedical.patient.AccountStatus;
import com.pt28.cabinetmedical.patient.Patient;
import com.pt28.cabinetmedical.patient.PatientRepository;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecordRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthIntegrationTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;
    @Autowired
    PatientRepository patientRepository;
    @Autowired
    MedicalRecordRepository medicalRecordRepository;

    @Test
    void staffLogin_withSeededAdmin_returnsAccessToken() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/staff/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin@cabinet.ma","password":"Admin123!"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.get("accessToken").asText()).isNotBlank();
    }

    @Test
    void patientLogin_withSeededPatient_returnsToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/patient/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cin":"AA123456","password":"Patient123!"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PATIENT"))
                .andExpect(jsonPath("$.principalType").value("PATIENT"));
    }

    @Test
    void registerPatient_createsPendingAccountWithMedicalRecord() throws Exception {
        mockMvc.perform(post("/api/v1/auth/patient/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "cin":"BB987654",
                                  "firstName":"Sara",
                                  "lastName":"Idrissi",
                                  "phone":"0611223344",
                                  "email":"sara@example.com",
                                  "birthDate":"1995-05-20",
                                  "address":"Rabat",
                                  "gender":"FEMALE",
                                  "password":"Secret123!"
                                }"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cin").value("BB987654"))
                .andExpect(jsonPath("$.accountStatus").value("PENDING"));

        Patient patient = patientRepository.findByCin("BB987654").orElseThrow();
        assertThat(patient.getAccountStatus()).isEqualTo(AccountStatus.PENDING);
        assertThat(medicalRecordRepository.existsByPatientId(patient.getId())).isTrue();
    }

    @Test
    void pendingPatient_cannotLogin() throws Exception {
        // Register (PENDING) then try to login -> forbidden (account not active).
        mockMvc.perform(post("/api/v1/auth/patient/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cin":"CC111222","firstName":"Omar","lastName":"Tazi","password":"Secret123!"}"""))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/patient/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"cin":"CC111222","password":"Secret123!"}"""))
                .andExpect(status().isForbidden());
    }

    @Test
    void patient_cannotCreateUrgentAppointment() throws Exception {
        String token = loginAndGetToken("/api/v1/auth/patient/login",
                "{\"cin\":\"AA123456\",\"password\":\"Patient123!\"}");

        mockMvc.perform(post("/api/v1/appointments/urgent")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"patientId":1,"doctorId":1,"date":"2030-01-01","startTime":"09:00:00"}"""))
                .andExpect(status().isForbidden());
    }

    @Test
    void me_returnsCurrentUser() throws Exception {
        String token = loginAndGetToken("/api/v1/auth/staff/login",
                "{\"email\":\"admin@cabinet.ma\",\"password\":\"Admin123!\"}");

        mockMvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.username").value("admin@cabinet.ma"));
    }

    private String loginAndGetToken(String url, String json) throws Exception {
        MvcResult result = mockMvc.perform(post(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
    }
}
