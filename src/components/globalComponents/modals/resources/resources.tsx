import React, { useState,useEffect, ChangeEvent } from 'react';
import './resources.css';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { baseUrl } from 'src/utils/jsonData';
import axios from 'axios';


interface ResourceOption {
    value: string;
    label: string;
    url: string;
    category: string;
  }

const SendResourcesComponent = (props:any) => {
  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

//   {
//     "event": "Notes",
//     "content": "Had Talk with other teacher about tardiness to other classes"
// }
//Add PUT controller to update followup date
    const handleSubmitResources = () => {

      const labelsSent: string[] = [];
      selectedItems.forEach((item)=>{
        labelsSent.push(item.label)
      })

      const urlSent:string[] = []
      selectedItems.forEach((item)=>{
        urlSent.push(item.url)

      })

      const payload = {
       
        resourceOptionList: selectedItems

      }

  
      const url =`${baseUrl}/punish/v1/guidance/resources/${props.activeTask}`
      axios.put(url, payload,{headers})
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  
      props.setDisplayModal(false);
      setTimeout(()=>{
          props.setUpdatePage((prev: any) => !prev);
      },500)

 
      console.log(selectedItems)
        // props.setDisplayModal(false);
    }

    const [filter,setFilter] = useState<string>("")


    const RESOURCESOPTIONS: ResourceOption[] = [
        { value: "homework_help", label: "Homework Help", url: "https://www.fakeurl.com/homework_help", category: "Academic Support" },
        { value: "online_library", label: "Online Library", url: "https://www.fakeurl.com/online_library", category: "Academic Resources" },
        { value: "counseling_services", label: "Counseling Services", url: "https://www.fakeurl.com/counseling_services", category: "Wellness" },
        { value: "extracurricular_activities", label: "Extracurricular Activities", url: "https://www.fakeurl.com/extracurricular_activities", category: "Activities" },
        { value: "parent_resources", label: "Parent Resources", url: "https://www.fakeurl.com/parent_resources", category: "Parental Support" },
        { value: "school_calendar", label: "School Calendar", url: "https://www.fakeurl.com/school_calendar", category: "Information" },
        { value: "student_portal", label: "Student Portal", url: "https://www.fakeurl.com/student_portal", category: "Academic Resources" },
        { value: "teacher_contacts", label: "Teacher Contacts", url: "https://www.fakeurl.com/teacher_contacts", category: "Communication" },
        { value: "virtual_tours", label: "Virtual Tours", url: "https://www.fakeurl.com/virtual_tours", category: "Activities" },
        { value: "study_guides", label: "Study Guides", url: "https://www.fakeurl.com/study_guides", category: "Academic Support" }
      ];

    const handleFilter = (event:any) =>{
        setFilter(event.target.value)
    }

    const [filteredOptions,setFilteredOptions] = useState(RESOURCESOPTIONS)


useEffect(()=>{
    if(filter === ""){
        setFilteredOptions(RESOURCESOPTIONS)

    }else{
        setFilteredOptions(RESOURCESOPTIONS.filter(item=> item.value.includes(filter)))

    }

},[filter])


const [selectedItems, setSelectedItems] = useState<ResourceOption[]>([]);

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>, item: ResourceOption) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem.value !== item.value));
    }
  };






    return (
        <div className='generic-modal-container'>
            <div className='resource-container'>
            <div className='resource-header'>
            <div className='close-icon' onClick={()=>props.setDisplayModal(false)}>[x]</div>
            </div>
            <input placeholder=' search...' className="search-bar-resources" onChange={handleFilter}/>
            <div className='mapped-items'>
            <FormGroup>


            {filteredOptions.map((item, index) => (
        <FormControlLabel
          key={index}
          style={{ color: "black" }}
          control={
            <Checkbox
              checked={selectedItems.some(selectedItem => selectedItem.value === item.value)}
              onChange={(event) => handleCheckboxChange(event, item)}
            />
          }
          label={item.label}
        />
      ))}
                </FormGroup>


            </div>
            <div className='selected-answers'>
                {selectedItems.map((items:any)=>{
                    return(

                    <div className='resource-chip' >{items.label}</div>
                    )
                })}
            </div>
           


            <div className="btn-container">
            <button onClick={handleSubmitResources} className='resource-submit-btn'  >Submit</button>
            </div>

            </div>
       
         
        </div>
    );
}

export default SendResourcesComponent;
