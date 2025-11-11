// =========================
// Shared JavaScript for Smart Resume Builder
// =========================

// -------------------------
// Helper functions
// -------------------------
function $(id){ return document.getElementById(id); }

function safeText(txt){
    return txt.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// -------------------------
// Login / Signup (index.html)
// -------------------------
function initLoginPage(){
    const startBtn = $('startBtn');
    startBtn.addEventListener('click', ()=>{
        const user = localStorage.getItem('sr_user');
        if(!user){
            const name = prompt("Welcome! Enter your name to start:");
            if(!name) return alert("Name is required!");
            localStorage.setItem('sr_user', name);
        }
        window.location.href='options.html';
    });
}

// -------------------------
// Options page (options.html)
// -------------------------
function initOptionsPage(){
    $('createNew').addEventListener('click', ()=> window.location.href='form.html');

    $('viewSaved').addEventListener('click', ()=>{
        const data = localStorage.getItem('sr_resume');
        if(!data){
            alert("No saved resume found! Create one first.");
            return;
        }
        window.location.href='preview.html';
    });
}

// -------------------------
// Form page (form.html)
// -------------------------
function initFormPage(){
    // Inputs
    const nameI = $('name'), emailI=$('email'), phoneI=$('phone'),
          summaryI=$('summary'), educationI=$('education'), skillsI=$('skills'), projectsI=$('projects');

    // Preview elements
    const pvName=$('pv-name'), pvEmail=$('pv-email'), pvPhone=$('pv-phone'),
          pvSummary=$('pv-summary'), pvEd=$('pv-ed'), pvSkills=$('pv-skills'), pvPrj=$('pv-prj');

    function updatePreview(){
        pvName.textContent = nameI.value || 'Your Name';
        pvEmail.textContent = emailI.value || 'email@example.com';
        pvPhone.textContent = phoneI.value || '+91 xxxxx';
        pvSummary.textContent = summaryI.value || 'Professional summary will appear here.';

        // Education
        const edLines = educationI.value.split('\n').map(s=>s.trim()).filter(Boolean);
        pvEd.innerHTML = edLines.length ? edLines.map(l=><li>${safeText(l)}</li>).join('') : '<li>Education details will appear here.</li>';

        // Skills
        const sk = skillsI.value.split(',').map(s=>s.trim()).filter(Boolean);
        pvSkills.innerHTML = sk.length ? sk.map(s=><span class="skill">${safeText(s)}</span>).join('') : '<span class="skill">Skill 1</span>';

        // Projects
        const pr = projectsI.value.split('\n').map(s=>s.trim()).filter(Boolean);
        pvPrj.innerHTML = pr.length ? pr.map(l=><li>${safeText(l)}</li>).join('') : '<li>Project 1 - short description</li>';
    }

    // Attach live preview
    [nameI,emailI,phoneI,summaryI,educationI,skillsI,projectsI].forEach(el => el.addEventListener('input', updatePreview));

    // Load existing data
    const saved = localStorage.getItem('sr_resume');
    if(saved){
        try{
            const d = JSON.parse(saved);
            nameI.value=d.name||''; emailI.value=d.email||''; phoneI.value=d.phone||'';
            summaryI.value=d.summary||''; educationI.value=d.education||''; skillsI.value=d.skills||''; projectsI.value=d.projects||'';
        }catch(e){}
    }
    updatePreview();

    // Buttons
    $('generateBtn').addEventListener('click', ()=>{
        saveResume();
        window.location.href='preview.html';
    });

    $('saveBtn').addEventListener('click', ()=>{
        saveResume();
        alert("Saved locally! You can view it on Preview page.");
    });

    $('clearForm').addEventListener('click', ()=>{
        if(!confirm("Clear all fields?")) return;
        [nameI,emailI,phoneI,summaryI,educationI,skillsI,projectsI].forEach(i=>i.value='');
        updatePreview();
    });

    function saveResume(){
        const payload = {
            name:nameI.value, email:emailI.value, phone:phoneI.value,
            summary:summaryI.value, education:educationI.value,
            skills:skillsI.value, projects:projectsI.value
        };
        localStorage.setItem('sr_resume', JSON.stringify(payload));
    }
}

// -------------------------
// Preview page (preview.html)
// -------------------------
function initPreviewPage(){
    const finalResume = $('resumeContainer');
    const data = localStorage.getItem('sr_resume');
    if(!data){
        alert("No resume found! Create one first.");
        window.location.href='form.html';
        return;
    }

    const d = JSON.parse(data);

    const ed = d.education.split('\n').map(s=>s.trim()).filter(Boolean).map(l=><li>${safeText(l)}</li>).join('')||'<li>Education details will appear here.</li>';
    const sk = d.skills.split(',').map(s=>s.trim()).filter(Boolean).map(s=><span class="skill">${safeText(s)}</span>).join('')||'<span class="skill">Skill 1</span>';
    const pr = d.projects.split('\n').map(s=>s.trim()).filter(Boolean).map(l=><li>${safeText(l)}</li>).join('')||'<li>Project 1 - short description</li>';

    finalResume.innerHTML = `
        <div class="r-head">
            <h2>${safeText(d.name)}</h2>
            <div class="contact">${safeText(d.email)} • ${safeText(d.phone)}</div>
        </div>
        <hr />
        <div class="r-block"><h4>Summary</h4><p>${safeText(d.summary)}</p></div>
        <div class="r-block"><h4>Education</h4><ul>${ed}</ul></div>
        <div class="r-block"><h4>Skills</h4><div class="skills-list">${sk}</div></div>
        <div class="r-block"><h4>Projects</h4><ul>${pr}</ul></div>
    `;

    // Download PDF
    $('downloadBtn').addEventListener('click', ()=>{
        html2pdf().set({margin:0.5, filename:(d.name||'Resume')+'.pdf', html2canvas:{scale:2}}).from(finalResume).save();
    });
}

// -------------------------
// Init page based on body id
// -------------------------
window.addEventListener('DOMContentLoaded', ()=>{
    const bodyId = document.body.id;
    switch(bodyId){
        case 'index': initLoginPage(); break;
        case 'options': initOptionsPage(); break;
        case 'form': initFormPage(); break;
        case 'preview': initPreviewPage(); break;
    }
});